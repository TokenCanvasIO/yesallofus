# iOS API Client Skill

## Overview
This skill documents the API client implementation for the YesAllOfUs iOS app, including all endpoint definitions, authentication, and error handling.

## Base Configuration

```swift
enum APIConfig {
    static let baseURL = "https://api.dltpays.com"
    static let apiVersion = "v1"
    static let nfcPath = "/nfc/api/v1"
    static let mainPath = "/api/v1"
    static let pluginsPath = "/plugins/api/v1"

    static let timeout: TimeInterval = 30
    static let retryCount = 3
    static let retryDelay: TimeInterval = 1
}
```

## API Client Implementation

```swift
import Foundation

actor APIClient {
    private let session: URLSession
    private let sessionManager: SessionManager
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(sessionManager: SessionManager) {
        self.sessionManager = sessionManager

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = APIConfig.timeout
        config.timeoutIntervalForResource = APIConfig.timeout * 2
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601

        self.encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
    }

    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        let request = try await buildRequest(for: endpoint)

        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AppError.network(.invalidResponse)
        }

        try validateResponse(httpResponse, data: data)

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            print("Decoding error: \(error)")
            throw AppError.network(.decodingFailed)
        }
    }

    func requestVoid(_ endpoint: APIEndpoint) async throws {
        let request = try await buildRequest(for: endpoint)
        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AppError.network(.invalidResponse)
        }

        try validateResponse(httpResponse, data: data)
    }

    // MARK: - Private Helpers

    private func buildRequest(for endpoint: APIEndpoint) async throws -> URLRequest {
        guard let url = endpoint.url else {
            throw AppError.network(.invalidResponse)
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth headers if authenticated endpoint
        if endpoint.requiresAuth {
            guard let wallet = sessionManager.walletAddress else {
                throw AppError.unauthorized
            }
            let auth = try await WalletAuthService.generateAuth(wallet: wallet)
            request.setValue(auth.signature, forHTTPHeaderField: "x-wallet-signature")
            request.setValue(auth.timestamp, forHTTPHeaderField: "x-wallet-timestamp")
        }

        // Add query parameters to URL
        if let queryParams = endpoint.queryParameters, !queryParams.isEmpty {
            var components = URLComponents(url: url, resolvingAgainstBaseURL: false)
            components?.queryItems = queryParams.map { URLQueryItem(name: $0.key, value: $0.value) }
            if let newURL = components?.url {
                request.url = newURL
            }
        }

        // Add body
        if let body = endpoint.body {
            request.httpBody = try encoder.encode(body)
        }

        return request
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        var lastError: Error = AppError.network(.noConnection)

        for attempt in 0..<APIConfig.retryCount {
            do {
                return try await session.data(for: request)
            } catch let error as URLError {
                lastError = mapURLError(error)
                if !isRetryable(error) { break }
                if attempt < APIConfig.retryCount - 1 {
                    try await Task.sleep(nanoseconds: UInt64(APIConfig.retryDelay * Double(attempt + 1) * 1_000_000_000))
                }
            }
        }

        throw lastError
    }

    private func validateResponse(_ response: HTTPURLResponse, data: Data) throws {
        switch response.statusCode {
        case 200...299:
            return
        case 401:
            throw AppError.unauthorized
        case 404:
            throw AppError.notFound
        case 400...499:
            if let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data) {
                throw AppError.validation(errorResponse.error)
            }
            throw AppError.validation("Bad request")
        case 500...599:
            if let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data) {
                throw AppError.server(errorResponse.error)
            }
            throw AppError.server("Server error")
        default:
            throw AppError.unknown("Unexpected status code: \(response.statusCode)")
        }
    }

    private func mapURLError(_ error: URLError) -> AppError {
        switch error.code {
        case .notConnectedToInternet, .networkConnectionLost:
            return .network(.noConnection)
        case .timedOut:
            return .network(.timeout)
        default:
            return .network(.invalidResponse)
        }
    }

    private func isRetryable(_ error: URLError) -> Bool {
        switch error.code {
        case .timedOut, .networkConnectionLost:
            return true
        default:
            return false
        }
    }
}

struct APIErrorResponse: Decodable {
    let success: Bool
    let error: String
}
```

## Wallet Authentication

Port of the web `lib/walletAuth.ts` HMAC authentication:

```swift
import Foundation
import CryptoKit

enum WalletAuthService {
    private static let secret = "yesallofus-wallet-auth-2026"

    struct AuthToken {
        let signature: String
        let timestamp: String
    }

    static func generateAuth(wallet: String) async throws -> AuthToken {
        let timestamp = String(Int(Date().timeIntervalSince1970 * 1000))
        let message = "\(wallet):\(timestamp)"

        let key = SymmetricKey(data: Data(secret.utf8))
        let signature = HMAC<SHA256>.authenticationCode(
            for: Data(message.utf8),
            using: key
        )
        let signatureHex = signature.map { String(format: "%02x", $0) }.joined()

        return AuthToken(signature: signatureHex, timestamp: timestamp)
    }
}
```

## API Endpoints

### Endpoint Definition

```swift
enum HTTPMethod: String {
    case GET, POST, PUT, DELETE
}

struct APIEndpoint {
    let path: String
    let method: HTTPMethod
    let queryParameters: [String: String]?
    let body: Encodable?
    let requiresAuth: Bool
    let basePathType: BasePathType

    enum BasePathType {
        case main      // /api/v1
        case nfc       // /nfc/api/v1
        case plugins   // /plugins/api/v1
    }

    var url: URL? {
        let basePath: String
        switch basePathType {
        case .main:
            basePath = APIConfig.mainPath
        case .nfc:
            basePath = APIConfig.nfcPath
        case .plugins:
            basePath = APIConfig.pluginsPath
        }
        return URL(string: APIConfig.baseURL + basePath + path)
    }
}
```

### All Endpoints

```swift
extension APIEndpoint {

    // MARK: - Health
    static var health: APIEndpoint {
        APIEndpoint(
            path: "/health",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    // MARK: - Authentication

    static func xamanLogin() -> APIEndpoint {
        APIEndpoint(
            path: "/xaman/login",
            method: .POST,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .main
        )
    }

    static func pollXamanLogin(loginId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/xaman/login/poll/\(loginId)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .main
        )
    }

    // MARK: - Store

    static func registerStore(input: RegisterStoreInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/register",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .main
        )
    }

    static func getStore(storeId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/public/\(storeId)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func getStoreStats(storeId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/stats",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .main
        )
    }

    static func updateStoreLogo(storeId: String, input: UpdateLogoInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/logo",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Products

    static func getProducts(storeId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func createProduct(storeId: String, input: CreateProductInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func updateProduct(storeId: String, productId: String, input: UpdateProductInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products/\(productId)",
            method: .PUT,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func deleteProduct(storeId: String, productId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products/\(productId)",
            method: .DELETE,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func lookupBarcode(storeId: String, barcode: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products/barcode/\(barcode.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? barcode)",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getLowStockProducts(storeId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products/low-stock",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func bulkImportProducts(storeId: String, input: BulkImportInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/products/bulk",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Inventory

    static func adjustInventory(storeId: String, productId: String, input: InventoryAdjustInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/inventory/\(productId)/adjust",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getInventoryHistory(storeId: String, walletAddress: String, productId: String? = nil, limit: Int = 50) -> APIEndpoint {
        var params = ["wallet_address": walletAddress, "limit": String(limit)]
        if let productId = productId {
            params["product_id"] = productId
        }
        return APIEndpoint(
            path: "/store/\(storeId)/inventory/history",
            method: .GET,
            queryParameters: params,
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - NFC Cards

    static func registerNFCCard(input: RegisterNFCCardInput) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/register",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func linkNFCCard(input: LinkNFCCardInput) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/link-card",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func unlinkNFCCard(input: UnlinkNFCCardInput) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/unlink-card",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func lookupNFCCard(uid: String) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/lookup/\(uid)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func getCardsByWallet(wallet: String) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/cards-by-wallet/\(wallet)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func updateCardName(uid: String, input: UpdateCardNameInput) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/card/\(uid)/name",
            method: .PUT,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Payments

    static func processNFCPayment(input: NFCPaymentInput) -> APIEndpoint {
        APIEndpoint(
            path: "/nfc/payment",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func createPaymentLink(input: CreatePaymentLinkInput) -> APIEndpoint {
        APIEndpoint(
            path: "/payment-link/create",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getPaymentLink(paymentId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/payment-link/\(paymentId)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func addTipToPayment(paymentId: String, input: AddTipInput) -> APIEndpoint {
        APIEndpoint(
            path: "/payment-link/\(paymentId)/tip",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func payPaymentLink(paymentId: String, input: PayPaymentInput) -> APIEndpoint {
        APIEndpoint(
            path: "/payment-link/\(paymentId)/pay",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func cancelPayment(paymentId: String, input: CancelPaymentInput) -> APIEndpoint {
        APIEndpoint(
            path: "/payment-link/\(paymentId)/cancel",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getPendingPayments(storeId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/pending-payments",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func sendPaymentLinkEmail(input: SendPaymentEmailInput) -> APIEndpoint {
        APIEndpoint(
            path: "/payment-link/send-email",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Sound Pay

    static func createSoundPayToken(input: CreateSoundPayInput) -> APIEndpoint {
        APIEndpoint(
            path: "/sound-payment/token",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func redeemSoundPayToken(token: String) -> APIEndpoint {
        APIEndpoint(
            path: "/sound-payment/redeem/\(token)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func processSoundPayment(input: ProcessSoundPayInput) -> APIEndpoint {
        APIEndpoint(
            path: "/sound-payment/pay",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    // MARK: - Receipts

    static func getReceipts(storeId: String, walletAddress: String, limit: Int = 50) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/receipts",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress, "limit": String(limit)],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getReceipt(receiptId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/receipts/\(receiptId)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func createReceipt(input: CreateReceiptInput) -> APIEndpoint {
        APIEndpoint(
            path: "/receipts",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func emailReceipt(input: EmailReceiptInput) -> APIEndpoint {
        APIEndpoint(
            path: "/receipt/email",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Staff

    static func getStaff(storeId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func createStaff(storeId: String, input: CreateStaffInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func updateStaff(storeId: String, staffId: String, input: UpdateStaffInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff/\(staffId)",
            method: .PUT,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func deleteStaff(storeId: String, staffId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff/\(staffId)",
            method: .DELETE,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func clockIn(storeId: String, staffId: String, input: ClockInInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff/\(staffId)/clock-in",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func clockOut(storeId: String, staffId: String, input: ClockOutInput) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff/\(staffId)/clock-out",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getShiftSummary(storeId: String, staffId: String, walletAddress: String) -> APIEndpoint {
        APIEndpoint(
            path: "/store/\(storeId)/staff/\(staffId)/shift-summary",
            method: .GET,
            queryParameters: ["wallet_address": walletAddress],
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Wallet

    static func getWalletStatus(wallet: String) -> APIEndpoint {
        APIEndpoint(
            path: "/wallet/status/\(wallet)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .main
        )
    }

    static func setupAutoSign(input: SetupAutoSignInput) -> APIEndpoint {
        APIEndpoint(
            path: "/customer/setup-autosign",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func getAutoSignStatus(wallet: String) -> APIEndpoint {
        APIEndpoint(
            path: "/customer/autosign-status/\(wallet)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func revokeAutoSign(input: RevokeAutoSignInput) -> APIEndpoint {
        APIEndpoint(
            path: "/customer/revoke-autosign",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    // MARK: - Customer Display

    static func getDisplayStatus(storeId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/display/\(storeId)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func updateDisplay(input: UpdateDisplayInput) -> APIEndpoint {
        APIEndpoint(
            path: "/display/update",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func setDisplayTip(storeId: String, input: SetDisplayTipInput) -> APIEndpoint {
        APIEndpoint(
            path: "/display/\(storeId)/tip",
            method: .POST,
            queryParameters: nil,
            body: input,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    static func confirmDisplay(storeId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/display/\(storeId)/confirm",
            method: .POST,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    // MARK: - Customer

    static func getCustomerMilestones(wallet: String) -> APIEndpoint {
        APIEndpoint(
            path: "/customer/milestones/\(wallet)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: true,
            basePathType: .nfc
        )
    }

    static func customerExists(wallet: String) -> APIEndpoint {
        APIEndpoint(
            path: "/customer/exists/\(wallet)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .nfc
        )
    }

    // MARK: - Xaman Payments

    static func pollXamanPayment(paymentId: String) -> APIEndpoint {
        APIEndpoint(
            path: "/xaman/payment/poll/\(paymentId)",
            method: .GET,
            queryParameters: nil,
            body: nil,
            requiresAuth: false,
            basePathType: .main
        )
    }

    // MARK: - Currency Conversion

    static func convertGBPtoRLUSD(amount: Double) -> APIEndpoint {
        APIEndpoint(
            path: "/convert/gbp-to-rlusd",
            method: .GET,
            queryParameters: ["amount": String(amount), "capture": "true"],
            body: nil,
            requiresAuth: false,
            basePathType: .main
        )
    }
}
```

## Request/Response DTOs

### Input DTOs

```swift
// MARK: - Store
struct RegisterStoreInput: Encodable {
    let walletAddress: String
    let storeName: String
    let storeType: String?
}

struct UpdateLogoInput: Encodable {
    let walletAddress: String
    let logoData: String // Base64 encoded
}

// MARK: - Products
struct CreateProductInput: Encodable {
    let walletAddress: String
    let name: String
    let price: Double
    let sku: String?
    let category: String?
    let emoji: String?
    let iconId: String?
    let imageUrl: String?
    let barcode: String?
    let trackStock: Bool
    let quantity: Int
    let lowStockThreshold: Int
}

struct UpdateProductInput: Encodable {
    let walletAddress: String
    let name: String?
    let price: Double?
    let category: String?
    let emoji: String?
    let iconId: String?
    let imageUrl: String?
    let barcode: String?
    let trackStock: Bool?
    let quantity: Int?
    let lowStockThreshold: Int?
}

struct BulkImportInput: Encodable {
    let walletAddress: String
    let products: [CreateProductInput]
}

// MARK: - Inventory
struct InventoryAdjustInput: Encodable {
    let walletAddress: String
    let adjustment: Int
    let reason: String
    let notes: String?
}

// MARK: - NFC Cards
struct RegisterNFCCardInput: Encodable {
    let uid: String
    let wallet: String
    let phone: String?
    let email: String?
    let name: String?
    let vendorId: String?
}

struct LinkNFCCardInput: Encodable {
    let uid: String
    let wallet: String
    let cardName: String?
}

struct UnlinkNFCCardInput: Encodable {
    let uid: String
    let wallet: String
}

struct UpdateCardNameInput: Encodable {
    let wallet: String
    let cardName: String
}

// MARK: - Payments
struct NFCPaymentInput: Encodable {
    let uid: String
    let vendorWallet: String
    let amount: Double
    let currency: String
    let storeId: String
    let staffId: String?
    let items: [PaymentItem]?
    let tip: Double?
}

struct PaymentItem: Encodable {
    let productId: String
    let name: String
    let price: Double
    let quantity: Int
}

struct CreatePaymentLinkInput: Encodable {
    let storeId: String
    let walletAddress: String
    let amount: Double
    let items: [PaymentItem]?
    let tip: Double?
    let tipsEnabled: Bool
}

struct AddTipInput: Encodable {
    let tip: Double
}

struct PayPaymentInput: Encodable {
    let customerWallet: String
    let useAutoSign: Bool?
}

struct CancelPaymentInput: Encodable {
    let walletAddress: String
}

struct SendPaymentEmailInput: Encodable {
    let paymentId: String
    let email: String
    let walletAddress: String
}

// MARK: - Sound Pay
struct CreateSoundPayInput: Encodable {
    let storeId: String
    let walletAddress: String
    let amount: Double
    let items: [PaymentItem]?
}

struct ProcessSoundPayInput: Encodable {
    let token: String
    let customerWallet: String
}

// MARK: - Receipts
struct CreateReceiptInput: Encodable {
    let storeId: String
    let walletAddress: String
    let items: [PaymentItem]
    let subtotal: Double
    let tip: Double?
    let total: Double
    let txHash: String?
    let staffId: String?
}

struct EmailReceiptInput: Encodable {
    let receiptId: String
    let email: String
    let walletAddress: String
}

// MARK: - Staff
struct CreateStaffInput: Encodable {
    let walletAddress: String
    let name: String
    let role: String
    let pin: String?
    let photoUrl: String?
}

struct UpdateStaffInput: Encodable {
    let walletAddress: String
    let name: String?
    let role: String?
    let pin: String?
    let photoUrl: String?
}

struct ClockInInput: Encodable {
    let walletAddress: String
}

struct ClockOutInput: Encodable {
    let walletAddress: String
}

// MARK: - Wallet
struct SetupAutoSignInput: Encodable {
    let wallet: String
}

struct RevokeAutoSignInput: Encodable {
    let wallet: String
}

// MARK: - Display
struct UpdateDisplayInput: Encodable {
    let storeId: String
    let status: String
    let items: [PaymentItem]?
    let total: Double?
    let tip: Double?
}

struct SetDisplayTipInput: Encodable {
    let tip: Double
}
```

### Response DTOs

```swift
// MARK: - Common
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: String?
}

// MARK: - Store
struct StoreResponse: Decodable {
    let success: Bool
    let store: StoreDTO
}

struct StoreDTO: Decodable {
    let storeId: String
    let storeName: String
    let walletAddress: String
    let logoUrl: String?
    let tier: String?
    let createdAt: String?
}

struct StatsResponse: Decodable {
    let success: Bool
    let stats: StatsDTO
}

struct StatsDTO: Decodable {
    let totalRevenue: Double
    let totalSales: Int
    let todayRevenue: Double
    let todaySales: Int
}

// MARK: - Products
struct ProductsResponse: Decodable {
    let success: Bool
    let products: [ProductDTO]
}

struct ProductResponse: Decodable {
    let success: Bool
    let product: ProductDTO
}

struct ProductDTO: Decodable {
    let productId: String
    let name: String
    let price: Double
    let sku: String
    let category: String?
    let emoji: String?
    let iconId: String?
    let imageUrl: String?
    let barcode: String?
    let trackStock: Bool
    let quantity: Int
    let lowStockThreshold: Int
    let allowNegativeStock: Bool?
}

struct BulkImportResponse: Decodable {
    let success: Bool
    let created: Int
    let errors: [String]?
}

// MARK: - Inventory
struct InventoryHistoryResponse: Decodable {
    let success: Bool
    let history: [InventoryHistoryDTO]
}

struct InventoryHistoryDTO: Decodable {
    let historyId: String
    let productId: String
    let productName: String?
    let previousQuantity: Int
    let newQuantity: Int
    let adjustment: Int
    let reason: String
    let notes: String?
    let createdAt: String
    let createdBy: String?
}

// MARK: - NFC Cards
struct NFCCardResponse: Decodable {
    let success: Bool
    let card: NFCCardDTO?
}

struct NFCCardsResponse: Decodable {
    let success: Bool
    let cards: [NFCCardDTO]
}

struct NFCCardDTO: Decodable {
    let uid: String
    let uidDisplay: String?
    let wallet: String
    let cardName: String?
    let status: String
    let createdAt: String?
}

// MARK: - Payments
struct PaymentResponse: Decodable {
    let success: Bool
    let txHash: String?
    let receiptId: String?
    let rlusdAmount: Double?
}

struct PaymentLinkResponse: Decodable {
    let success: Bool
    let paymentId: String
    let payment: PaymentLinkDTO?
}

struct PaymentLinkDTO: Decodable {
    let paymentId: String
    let storeId: String
    let storeName: String?
    let amount: Double
    let rlusdAmount: Double?
    let items: [PaymentItemDTO]?
    let tip: Double?
    let status: String
    let createdAt: String
}

struct PaymentItemDTO: Decodable {
    let productId: String?
    let name: String
    let price: Double
    let quantity: Int
}

struct PendingPaymentsResponse: Decodable {
    let success: Bool
    let payments: [PaymentLinkDTO]
}

// MARK: - Sound Pay
struct SoundPayTokenResponse: Decodable {
    let success: Bool
    let token: String
    let paymentId: String
}

// MARK: - Receipts
struct ReceiptsResponse: Decodable {
    let success: Bool
    let receipts: [ReceiptDTO]
}

struct ReceiptResponse: Decodable {
    let success: Bool
    let receipt: ReceiptDTO
}

struct ReceiptDTO: Decodable {
    let receiptId: String
    let storeId: String
    let storeName: String?
    let items: [PaymentItemDTO]
    let subtotal: Double
    let tip: Double?
    let total: Double
    let txHash: String?
    let staffId: String?
    let staffName: String?
    let createdAt: String
}

// MARK: - Staff
struct StaffListResponse: Decodable {
    let success: Bool
    let staff: [StaffDTO]
}

struct StaffResponse: Decodable {
    let success: Bool
    let staff: StaffDTO
}

struct StaffDTO: Decodable {
    let staffId: String
    let name: String
    let role: String
    let photoUrl: String?
    let isClockedIn: Bool
    let clockedInAt: String?
}

struct ShiftSummaryResponse: Decodable {
    let success: Bool
    let summary: ShiftSummaryDTO
}

struct ShiftSummaryDTO: Decodable {
    let totalSales: Int
    let totalRevenue: Double
    let hoursWorked: Double
    let shiftsCount: Int
}

// MARK: - Wallet
struct WalletStatusResponse: Decodable {
    let success: Bool
    let funded: Bool
    let xrpBalance: Double
    let rlusdTrustline: Bool
    let rlusdBalance: Double
    let autoSigningEnabled: Bool?
}

struct AutoSignStatusResponse: Decodable {
    let success: Bool
    let enabled: Bool
    let multiSigAddress: String?
}

// MARK: - Customer
struct CustomerMilestonesResponse: Decodable {
    let success: Bool
    let milestones: CustomerMilestonesDTO
}

struct CustomerMilestonesDTO: Decodable {
    let firstCardLinkedAt: String?
    let firstPaymentAt: String?
    let autoSignEnabledAt: String?
}

// MARK: - Xaman
struct XamanLoginResponse: Decodable {
    let success: Bool
    let loginId: String
    let qrUrl: String
    let deepLink: String
}

struct XamanPollResponse: Decodable {
    let success: Bool
    let status: String
    let walletAddress: String?
}

// MARK: - Currency
struct ConversionResponse: Decodable {
    let success: Bool
    let rlusd: Double
    let rate: ConversionRateDTO
    let source: String
}

struct ConversionRateDTO: Decodable {
    let rlusdGbp: Double
}
```

## Usage Examples

```swift
// Fetch products
let response: ProductsResponse = try await apiClient.request(
    .getProducts(storeId: storeId, walletAddress: wallet)
)
let products = response.products.map(ProductMapper.toDomain)

// Create product
let input = CreateProductInput(
    walletAddress: wallet,
    name: "Coffee",
    price: 3.50,
    sku: nil,
    category: "Hot Drinks",
    emoji: "☕",
    iconId: nil,
    imageUrl: nil,
    barcode: "5901234123457",
    trackStock: true,
    quantity: 100,
    lowStockThreshold: 10
)
let response: ProductResponse = try await apiClient.request(
    .createProduct(storeId: storeId, input: input)
)

// Process NFC payment
let input = NFCPaymentInput(
    uid: nfcUID,
    vendorWallet: vendorWallet,
    amount: 15.50,
    currency: "GBP",
    storeId: storeId,
    staffId: activeStaffId,
    items: cartItems.map { PaymentItem(productId: $0.id, name: $0.name, price: $0.price, quantity: $0.quantity) },
    tip: 2.00
)
let response: PaymentResponse = try await apiClient.request(
    .processNFCPayment(input: input)
)
```
