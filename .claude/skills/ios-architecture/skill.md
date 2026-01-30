# iOS Architecture Skill

## Overview
This skill documents the MVVM + Clean Architecture + Coordinator pattern used in the YesAllOfUs iOS app.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION                           │
│  Views (SwiftUI) ◄─► ViewModels (@Observable) ◄─► Coordinators
├─────────────────────────────────────────────────────────────┤
│                        DOMAIN                               │
│  Use Cases ◄─► Repository Protocols ◄─► Entities            │
├─────────────────────────────────────────────────────────────┤
│                         DATA                                │
│  Repository Implementations ◄─► DTOs ◄─► Mappers            │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                           │
│  APIClient │ NFC │ Camera │ Audio │ Keychain │ Web3Auth     │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
YesAllOfUs/
├── App/
│   ├── YesAllOfUsApp.swift
│   ├── AppDelegate.swift
│   └── DIContainer.swift
├── Core/
│   ├── Network/
│   ├── Auth/
│   ├── Storage/
│   └── Utilities/
├── Domain/
│   ├── Entities/
│   ├── Repositories/
│   └── UseCases/
├── Data/
│   ├── Repositories/
│   ├── DTOs/
│   └── Mappers/
├── Infrastructure/
│   ├── NFC/
│   ├── Camera/
│   ├── Audio/
│   └── Blockchain/
├── Presentation/
│   ├── Coordinators/
│   ├── Common/
│   ├── Auth/
│   ├── Vendor/
│   └── Customer/
└── Resources/
```

## ViewModel Pattern

Use `@Observable` macro (iOS 17+) or `ObservableObject` for iOS 16 support.

### Standard ViewModel Template

```swift
import Foundation
import Combine

@Observable
final class ProductsViewModel {
    // MARK: - State
    enum State {
        case idle
        case loading
        case loaded([Product])
        case error(AppError)
    }

    private(set) var state: State = .idle
    private(set) var isRefreshing = false

    // MARK: - Dependencies
    private let fetchProductsUseCase: FetchProductsUseCaseProtocol
    private let deleteProductUseCase: DeleteProductUseCaseProtocol

    // MARK: - Init
    init(
        fetchProductsUseCase: FetchProductsUseCaseProtocol,
        deleteProductUseCase: DeleteProductUseCaseProtocol
    ) {
        self.fetchProductsUseCase = fetchProductsUseCase
        self.deleteProductUseCase = deleteProductUseCase
    }

    // MARK: - Actions
    @MainActor
    func loadProducts() async {
        state = .loading

        do {
            let products = try await fetchProductsUseCase.execute()
            state = .loaded(products)
        } catch let error as AppError {
            state = .error(error)
        } catch {
            state = .error(.unknown(error.localizedDescription))
        }
    }

    @MainActor
    func refresh() async {
        isRefreshing = true
        await loadProducts()
        isRefreshing = false
    }

    @MainActor
    func deleteProduct(_ product: Product) async throws {
        try await deleteProductUseCase.execute(productId: product.id)
        // Reload after deletion
        await loadProducts()
    }
}
```

### ViewModel with Form State

```swift
@Observable
final class ProductFormViewModel {
    // MARK: - Form Fields
    var name: String = ""
    var price: String = ""
    var category: String = ""
    var sku: String = ""
    var barcode: String = ""
    var trackStock: Bool = false
    var quantity: String = "0"
    var lowStockThreshold: String = "5"

    // MARK: - State
    private(set) var isSaving = false
    private(set) var validationErrors: [String: String] = [:]

    // MARK: - Computed
    var isValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        Double(price) != nil &&
        Double(price)! >= 0
    }

    var priceValue: Double {
        Double(price) ?? 0
    }

    // MARK: - Dependencies
    private let createProductUseCase: CreateProductUseCaseProtocol
    private let updateProductUseCase: UpdateProductUseCaseProtocol
    private let product: Product? // nil for create, non-nil for edit

    // MARK: - Init
    init(
        product: Product? = nil,
        createProductUseCase: CreateProductUseCaseProtocol,
        updateProductUseCase: UpdateProductUseCaseProtocol
    ) {
        self.product = product
        self.createProductUseCase = createProductUseCase
        self.updateProductUseCase = updateProductUseCase

        // Populate form if editing
        if let product = product {
            populateForm(from: product)
        }
    }

    private func populateForm(from product: Product) {
        name = product.name
        price = String(format: "%.2f", product.price)
        category = product.category ?? ""
        sku = product.sku
        barcode = product.barcode ?? ""
        trackStock = product.trackStock
        quantity = String(product.quantity)
        lowStockThreshold = String(product.lowStockThreshold)
    }

    // MARK: - Actions
    func validate() -> Bool {
        validationErrors = [:]

        if name.trimmingCharacters(in: .whitespaces).isEmpty {
            validationErrors["name"] = "Name is required"
        }

        if Double(price) == nil {
            validationErrors["price"] = "Invalid price"
        } else if Double(price)! < 0 {
            validationErrors["price"] = "Price must be positive"
        }

        return validationErrors.isEmpty
    }

    @MainActor
    func save() async throws -> Product {
        guard validate() else {
            throw AppError.validation("Please fix the errors")
        }

        isSaving = true
        defer { isSaving = false }

        let input = ProductInput(
            name: name.trimmingCharacters(in: .whitespaces),
            price: priceValue,
            category: category.isEmpty ? nil : category,
            sku: sku.isEmpty ? nil : sku,
            barcode: barcode.isEmpty ? nil : barcode,
            trackStock: trackStock,
            quantity: Int(quantity) ?? 0,
            lowStockThreshold: Int(lowStockThreshold) ?? 5
        )

        if let existingProduct = product {
            return try await updateProductUseCase.execute(
                productId: existingProduct.id,
                input: input
            )
        } else {
            return try await createProductUseCase.execute(input: input)
        }
    }
}
```

## Coordinator Pattern

Coordinators manage navigation flow and are responsible for creating ViewModels with their dependencies.

### Coordinator Protocol

```swift
import SwiftUI

@MainActor
protocol Coordinator: AnyObject {
    associatedtype RootView: View

    var navigationPath: NavigationPath { get set }

    @ViewBuilder
    func start() -> RootView
}
```

### App Coordinator

```swift
@Observable
@MainActor
final class AppCoordinator: Coordinator {
    // MARK: - State
    enum AppRoute: Hashable {
        case auth
        case vendor
        case customer
    }

    var navigationPath = NavigationPath()
    private(set) var currentRoute: AppRoute = .auth

    // MARK: - Dependencies
    private let container: DIContainer

    init(container: DIContainer) {
        self.container = container
        checkAuthState()
    }

    private func checkAuthState() {
        if let session = container.sessionManager.currentSession {
            currentRoute = session.isVendor ? .vendor : .customer
        } else {
            currentRoute = .auth
        }
    }

    // MARK: - Navigation
    func start() -> some View {
        Group {
            switch currentRoute {
            case .auth:
                makeAuthCoordinator().start()
            case .vendor:
                makeVendorCoordinator().start()
            case .customer:
                makeCustomerCoordinator().start()
            }
        }
    }

    func didLogin(as userType: UserType) {
        withAnimation {
            currentRoute = userType == .vendor ? .vendor : .customer
        }
    }

    func didLogout() {
        withAnimation {
            currentRoute = .auth
            navigationPath = NavigationPath()
        }
    }

    // MARK: - Child Coordinators
    private func makeAuthCoordinator() -> AuthCoordinator {
        AuthCoordinator(
            container: container,
            onLogin: { [weak self] userType in
                self?.didLogin(as: userType)
            }
        )
    }

    private func makeVendorCoordinator() -> VendorCoordinator {
        VendorCoordinator(
            container: container,
            onLogout: { [weak self] in
                self?.didLogout()
            }
        )
    }

    private func makeCustomerCoordinator() -> CustomerCoordinator {
        CustomerCoordinator(
            container: container,
            onLogout: { [weak self] in
                self?.didLogout()
            }
        )
    }
}
```

### Feature Coordinator Example

```swift
@Observable
@MainActor
final class VendorCoordinator: Coordinator {
    enum Route: Hashable {
        case dashboard
        case pos
        case products
        case productDetail(Product)
        case productForm(Product?)
        case barcodeScanner
        case staff
        case staffDetail(Staff)
        case receipts
        case receiptDetail(Receipt)
        case wallet
        case settings
    }

    var navigationPath = NavigationPath()

    private let container: DIContainer
    private let onLogout: () -> Void

    init(container: DIContainer, onLogout: @escaping () -> Void) {
        self.container = container
        self.onLogout = onLogout
    }

    func start() -> some View {
        NavigationStack(path: $navigationPath) {
            makeDashboardView()
                .navigationDestination(for: Route.self) { route in
                    destination(for: route)
                }
        }
    }

    @ViewBuilder
    private func destination(for route: Route) -> some View {
        switch route {
        case .dashboard:
            makeDashboardView()
        case .pos:
            makePOSView()
        case .products:
            makeProductsView()
        case .productDetail(let product):
            makeProductDetailView(product: product)
        case .productForm(let product):
            makeProductFormView(product: product)
        case .barcodeScanner:
            makeBarcodeScannerView()
        case .staff:
            makeStaffView()
        case .staffDetail(let staff):
            makeStaffDetailView(staff: staff)
        case .receipts:
            makeReceiptsView()
        case .receiptDetail(let receipt):
            makeReceiptDetailView(receipt: receipt)
        case .wallet:
            makeWalletView()
        case .settings:
            makeSettingsView()
        }
    }

    // MARK: - View Factories
    private func makeDashboardView() -> some View {
        let viewModel = VendorDashboardViewModel(
            fetchStatsUseCase: container.makeFetchStatsUseCase(),
            fetchActivityUseCase: container.makeFetchActivityUseCase()
        )
        return VendorDashboardView(viewModel: viewModel, coordinator: self)
    }

    private func makeProductsView() -> some View {
        let viewModel = ProductsViewModel(
            fetchProductsUseCase: container.makeFetchProductsUseCase(),
            deleteProductUseCase: container.makeDeleteProductUseCase()
        )
        return ProductsListView(viewModel: viewModel, coordinator: self)
    }

    private func makeProductFormView(product: Product?) -> some View {
        let viewModel = ProductFormViewModel(
            product: product,
            createProductUseCase: container.makeCreateProductUseCase(),
            updateProductUseCase: container.makeUpdateProductUseCase()
        )
        return ProductFormView(viewModel: viewModel, coordinator: self)
    }

    // ... other view factories

    // MARK: - Navigation Actions
    func showPOS() {
        navigationPath.append(Route.pos)
    }

    func showProducts() {
        navigationPath.append(Route.products)
    }

    func showProductDetail(_ product: Product) {
        navigationPath.append(Route.productDetail(product))
    }

    func showProductForm(editing product: Product? = nil) {
        navigationPath.append(Route.productForm(product))
    }

    func showBarcodeScanner() {
        navigationPath.append(Route.barcodeScanner)
    }

    func pop() {
        navigationPath.removeLast()
    }

    func popToRoot() {
        navigationPath = NavigationPath()
    }

    func logout() {
        container.sessionManager.logout()
        onLogout()
    }
}
```

## Dependency Injection Container

```swift
@MainActor
final class DIContainer {
    // MARK: - Core Services
    let apiClient: APIClient
    let sessionManager: SessionManager
    let keychainService: KeychainService
    let nfcService: NFCReaderService
    let cameraService: BarcodeScannerService

    // MARK: - Init
    init() {
        self.keychainService = KeychainService()
        self.sessionManager = SessionManager(keychain: keychainService)
        self.apiClient = APIClient(sessionManager: sessionManager)
        self.nfcService = NFCReaderService()
        self.cameraService = BarcodeScannerService()
    }

    // MARK: - Repository Factories
    func makeStoreRepository() -> StoreRepository {
        StoreRepositoryImpl(apiClient: apiClient)
    }

    func makeProductRepository() -> ProductRepository {
        ProductRepositoryImpl(apiClient: apiClient)
    }

    func makePaymentRepository() -> PaymentRepository {
        PaymentRepositoryImpl(apiClient: apiClient)
    }

    // MARK: - Use Case Factories
    func makeFetchProductsUseCase() -> FetchProductsUseCaseProtocol {
        FetchProductsUseCase(
            repository: makeProductRepository(),
            sessionManager: sessionManager
        )
    }

    func makeCreateProductUseCase() -> CreateProductUseCaseProtocol {
        CreateProductUseCase(
            repository: makeProductRepository(),
            sessionManager: sessionManager
        )
    }

    func makeDeleteProductUseCase() -> DeleteProductUseCaseProtocol {
        DeleteProductUseCase(
            repository: makeProductRepository(),
            sessionManager: sessionManager
        )
    }

    func makeLookupBarcodeUseCase() -> LookupBarcodeUseCaseProtocol {
        LookupBarcodeUseCase(
            repository: makeProductRepository(),
            sessionManager: sessionManager
        )
    }

    // ... other use case factories
}
```

## Repository Pattern

### Protocol Definition

```swift
protocol ProductRepository {
    func fetchProducts(storeId: String) async throws -> [Product]
    func fetchProduct(id: String) async throws -> Product
    func createProduct(storeId: String, input: ProductInput) async throws -> Product
    func updateProduct(id: String, input: ProductInput) async throws -> Product
    func deleteProduct(id: String) async throws
    func lookupByBarcode(storeId: String, barcode: String) async throws -> Product?
    func importProducts(storeId: String, products: [ProductInput]) async throws -> ImportResult
}
```

### Implementation

```swift
final class ProductRepositoryImpl: ProductRepository {
    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func fetchProducts(storeId: String) async throws -> [Product] {
        let response: ProductsResponse = try await apiClient.request(
            .getProducts(storeId: storeId)
        )
        return response.products.map(ProductMapper.toDomain)
    }

    func createProduct(storeId: String, input: ProductInput) async throws -> Product {
        let dto = ProductMapper.toDTO(input)
        let response: ProductResponse = try await apiClient.request(
            .createProduct(storeId: storeId, product: dto)
        )
        return ProductMapper.toDomain(response.product)
    }

    func lookupByBarcode(storeId: String, barcode: String) async throws -> Product? {
        do {
            let response: ProductResponse = try await apiClient.request(
                .lookupBarcode(storeId: storeId, barcode: barcode)
            )
            return ProductMapper.toDomain(response.product)
        } catch AppError.notFound {
            return nil
        }
    }

    // ... other implementations
}
```

## Use Case Pattern

```swift
protocol FetchProductsUseCaseProtocol {
    func execute() async throws -> [Product]
}

final class FetchProductsUseCase: FetchProductsUseCaseProtocol {
    private let repository: ProductRepository
    private let sessionManager: SessionManager

    init(repository: ProductRepository, sessionManager: SessionManager) {
        self.repository = repository
        self.sessionManager = sessionManager
    }

    func execute() async throws -> [Product] {
        guard let storeId = sessionManager.currentStoreId else {
            throw AppError.unauthorized
        }
        return try await repository.fetchProducts(storeId: storeId)
    }
}
```

## Error Handling

```swift
enum AppError: Error, Equatable {
    case network(NetworkError)
    case unauthorized
    case notFound
    case validation(String)
    case server(String)
    case unknown(String)

    var userMessage: String {
        switch self {
        case .network(let error):
            return error.userMessage
        case .unauthorized:
            return "Please log in again"
        case .notFound:
            return "Not found"
        case .validation(let message):
            return message
        case .server(let message):
            return message
        case .unknown(let message):
            return message
        }
    }
}

enum NetworkError: Error, Equatable {
    case noConnection
    case timeout
    case invalidResponse
    case decodingFailed

    var userMessage: String {
        switch self {
        case .noConnection:
            return "No internet connection"
        case .timeout:
            return "Request timed out"
        case .invalidResponse:
            return "Invalid server response"
        case .decodingFailed:
            return "Failed to parse response"
        }
    }
}
```

## View Patterns

### Standard List View

```swift
struct ProductsListView: View {
    @Bindable var viewModel: ProductsViewModel
    let coordinator: VendorCoordinator

    var body: some View {
        Group {
            switch viewModel.state {
            case .idle:
                Color.clear.onAppear {
                    Task { await viewModel.loadProducts() }
                }
            case .loading:
                LoadingView()
            case .loaded(let products):
                productsList(products)
            case .error(let error):
                ErrorView(error: error) {
                    Task { await viewModel.loadProducts() }
                }
            }
        }
        .navigationTitle("Products")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    coordinator.showProductForm()
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
    }

    @ViewBuilder
    private func productsList(_ products: [Product]) -> some View {
        if products.isEmpty {
            EmptyStateView(
                icon: "cube.box",
                title: "No products yet",
                message: "Add your first product to get started",
                action: ("Add Product", { coordinator.showProductForm() })
            )
        } else {
            List {
                ForEach(products) { product in
                    ProductRow(product: product)
                        .onTapGesture {
                            coordinator.showProductDetail(product)
                        }
                }
                .onDelete { indexSet in
                    Task {
                        for index in indexSet {
                            try? await viewModel.deleteProduct(products[index])
                        }
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
    }
}
```

## Testing

### ViewModel Testing

```swift
@MainActor
final class ProductsViewModelTests: XCTestCase {
    var sut: ProductsViewModel!
    var mockFetchUseCase: MockFetchProductsUseCase!
    var mockDeleteUseCase: MockDeleteProductUseCase!

    override func setUp() {
        super.setUp()
        mockFetchUseCase = MockFetchProductsUseCase()
        mockDeleteUseCase = MockDeleteProductUseCase()
        sut = ProductsViewModel(
            fetchProductsUseCase: mockFetchUseCase,
            deleteProductUseCase: mockDeleteUseCase
        )
    }

    func test_loadProducts_success() async {
        // Given
        let expectedProducts = [Product.mock(), Product.mock()]
        mockFetchUseCase.result = .success(expectedProducts)

        // When
        await sut.loadProducts()

        // Then
        if case .loaded(let products) = sut.state {
            XCTAssertEqual(products.count, 2)
        } else {
            XCTFail("Expected loaded state")
        }
    }

    func test_loadProducts_failure() async {
        // Given
        mockFetchUseCase.result = .failure(.network(.noConnection))

        // When
        await sut.loadProducts()

        // Then
        if case .error(let error) = sut.state {
            XCTAssertEqual(error, .network(.noConnection))
        } else {
            XCTFail("Expected error state")
        }
    }
}
```
