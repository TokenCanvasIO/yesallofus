# iOS Entities Skill

## Overview
This skill documents all domain entities (models) for the YesAllOfUs iOS app. These are the core data structures used throughout the application.

## Entity Design Principles

1. **Immutable by default** - Use `let` for properties
2. **Identifiable** - All entities conform to `Identifiable`
3. **Equatable/Hashable** - For SwiftUI list diffing
4. **Sendable** - For async/await safety
5. **No Codable** - Entities are separate from DTOs

## Core Entities

### Store

```swift
import Foundation

struct Store: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let name: String
    let walletAddress: String
    let logoUrl: String?
    let tier: StoreTier
    let createdAt: Date?

    // Computed
    var hasLogo: Bool { logoUrl != nil }
}

enum StoreTier: String, CaseIterable, Sendable {
    case free = "free"
    case starter = "starter"
    case pro = "pro"
    case enterprise = "enterprise"

    var displayName: String {
        switch self {
        case .free: return "Free"
        case .starter: return "Starter"
        case .pro: return "Pro"
        case .enterprise: return "Enterprise"
        }
    }
}
```

### Product

```swift
import Foundation

struct Product: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let storeId: String
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
    let allowNegativeStock: Bool
    let createdAt: Date?

    // MARK: - Computed Properties

    var formattedPrice: String {
        "£\(String(format: "%.2f", price))"
    }

    var displayIcon: ProductIcon {
        if let imageUrl = imageUrl {
            return .image(imageUrl)
        } else if let iconId = iconId {
            return .icon(iconId)
        } else if let emoji = emoji {
            return .emoji(emoji)
        } else {
            return .emoji(autoEmoji)
        }
    }

    var autoEmoji: String {
        let nameLower = name.lowercased()
        let emojiMap: [String: String] = [
            "coffee": "☕", "latte": "☕", "cappuccino": "☕", "espresso": "☕",
            "tea": "🍵", "water": "💧", "juice": "🧃", "smoothie": "🥤",
            "croissant": "🥐", "bagel": "🥯", "toast": "🍞", "sandwich": "🥪",
            "burger": "🍔", "pizza": "🍕", "salad": "🥗", "soup": "🍲",
            "cookie": "🍪", "cake": "🍰", "donut": "🍩", "ice cream": "🍦"
        ]
        for (key, emoji) in emojiMap {
            if nameLower.contains(key) { return emoji }
        }
        return "📦"
    }

    var isLowStock: Bool {
        trackStock && quantity <= lowStockThreshold && quantity > 0
    }

    var isOutOfStock: Bool {
        trackStock && quantity <= 0
    }

    var stockStatus: StockStatus {
        guard trackStock else { return .notTracked }
        if quantity <= 0 { return .outOfStock }
        if quantity <= lowStockThreshold { return .low }
        return .inStock
    }

    var canSell: Bool {
        !trackStock || quantity > 0 || allowNegativeStock
    }
}

enum ProductIcon: Equatable, Hashable, Sendable {
    case image(String)
    case icon(String)
    case emoji(String)
}

enum StockStatus: String, CaseIterable, Sendable {
    case notTracked
    case inStock
    case low
    case outOfStock

    var displayName: String {
        switch self {
        case .notTracked: return "Not Tracked"
        case .inStock: return "In Stock"
        case .low: return "Low Stock"
        case .outOfStock: return "Out of Stock"
        }
    }

    var color: String {
        switch self {
        case .notTracked: return "zinc"
        case .inStock: return "emerald"
        case .low: return "amber"
        case .outOfStock: return "red"
        }
    }
}
```

### CartItem

```swift
import Foundation

struct CartItem: Identifiable, Equatable, Hashable, Sendable {
    let id: String // Same as product.id
    let product: Product
    var quantity: Int

    var lineTotal: Double {
        product.price * Double(quantity)
    }

    var formattedLineTotal: String {
        "£\(String(format: "%.2f", lineTotal))"
    }

    init(product: Product, quantity: Int = 1) {
        self.id = product.id
        self.product = product
        self.quantity = quantity
    }

    mutating func increment() {
        quantity += 1
    }

    mutating func decrement() {
        if quantity > 1 {
            quantity -= 1
        }
    }
}
```

### Cart

```swift
import Foundation

struct Cart: Equatable, Sendable {
    private(set) var items: [CartItem] = []
    var tip: Double = 0

    // MARK: - Computed

    var isEmpty: Bool { items.isEmpty }

    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var subtotal: Double {
        items.reduce(0) { $0 + $1.lineTotal }
    }

    var total: Double {
        subtotal + tip
    }

    var formattedSubtotal: String {
        "£\(String(format: "%.2f", subtotal))"
    }

    var formattedTip: String {
        "£\(String(format: "%.2f", tip))"
    }

    var formattedTotal: String {
        "£\(String(format: "%.2f", total))"
    }

    // MARK: - Mutations

    mutating func add(_ product: Product) {
        if let index = items.firstIndex(where: { $0.product.id == product.id }) {
            items[index].increment()
        } else {
            items.append(CartItem(product: product))
        }
    }

    mutating func remove(_ product: Product) {
        items.removeAll { $0.product.id == product.id }
    }

    mutating func decrement(_ product: Product) {
        guard let index = items.firstIndex(where: { $0.product.id == product.id }) else { return }
        if items[index].quantity > 1 {
            items[index].decrement()
        } else {
            items.remove(at: index)
        }
    }

    mutating func setQuantity(_ product: Product, quantity: Int) {
        if quantity <= 0 {
            remove(product)
        } else if let index = items.firstIndex(where: { $0.product.id == product.id }) {
            items[index].quantity = quantity
        } else {
            items.append(CartItem(product: product, quantity: quantity))
        }
    }

    mutating func setTip(_ amount: Double) {
        tip = max(0, amount)
    }

    mutating func clear() {
        items = []
        tip = 0
    }

    func quantity(for product: Product) -> Int {
        items.first { $0.product.id == product.id }?.quantity ?? 0
    }

    func contains(_ product: Product) -> Bool {
        items.contains { $0.product.id == product.id }
    }
}
```

### Payment

```swift
import Foundation

struct Payment: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let storeId: String
    let storeName: String?
    let amount: Double
    let rlusdAmount: Double?
    let items: [PaymentItem]
    let tip: Double?
    let status: PaymentStatus
    let txHash: String?
    let receiptId: String?
    let customerWallet: String?
    let createdAt: Date

    var formattedAmount: String {
        "£\(String(format: "%.2f", amount))"
    }

    var formattedRLUSD: String? {
        guard let rlusd = rlusdAmount else { return nil }
        return "\(String(format: "%.6f", rlusd)) RLUSD"
    }

    var totalWithTip: Double {
        amount + (tip ?? 0)
    }
}

struct PaymentItem: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let productId: String?
    let name: String
    let price: Double
    let quantity: Int

    var lineTotal: Double {
        price * Double(quantity)
    }

    init(id: String = UUID().uuidString, productId: String?, name: String, price: Double, quantity: Int) {
        self.id = id
        self.productId = productId
        self.name = name
        self.price = price
        self.quantity = quantity
    }

    init(from cartItem: CartItem) {
        self.id = UUID().uuidString
        self.productId = cartItem.product.id
        self.name = cartItem.product.name
        self.price = cartItem.product.price
        self.quantity = cartItem.quantity
    }
}

enum PaymentStatus: String, CaseIterable, Sendable {
    case pending = "pending"
    case confirmed = "confirmed"
    case processing = "processing"
    case completed = "completed"
    case failed = "failed"
    case cancelled = "cancelled"
    case expired = "expired"

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .confirmed: return "Confirmed"
        case .processing: return "Processing"
        case .completed: return "Completed"
        case .failed: return "Failed"
        case .cancelled: return "Cancelled"
        case .expired: return "Expired"
        }
    }

    var isTerminal: Bool {
        switch self {
        case .completed, .failed, .cancelled, .expired:
            return true
        default:
            return false
        }
    }

    var isSuccess: Bool {
        self == .completed
    }
}
```

### Receipt

```swift
import Foundation

struct Receipt: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let storeId: String
    let storeName: String?
    let items: [PaymentItem]
    let subtotal: Double
    let tip: Double?
    let total: Double
    let txHash: String?
    let staffId: String?
    let staffName: String?
    let createdAt: Date

    var formattedSubtotal: String {
        "£\(String(format: "%.2f", subtotal))"
    }

    var formattedTip: String? {
        guard let tip = tip, tip > 0 else { return nil }
        return "£\(String(format: "%.2f", tip))"
    }

    var formattedTotal: String {
        "£\(String(format: "%.2f", total))"
    }

    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var hasTransactionHash: Bool {
        txHash != nil && !txHash!.isEmpty
    }

    var explorerUrl: URL? {
        guard let hash = txHash else { return nil }
        return URL(string: "https://livenet.xrpl.org/transactions/\(hash)")
    }
}
```

### Staff

```swift
import Foundation

struct Staff: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let storeId: String
    let name: String
    let role: StaffRole
    let photoUrl: String?
    let isClockedIn: Bool
    let clockedInAt: Date?
    let createdAt: Date?

    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    var statusText: String {
        isClockedIn ? "On shift" : "Off"
    }
}

enum StaffRole: String, CaseIterable, Sendable {
    case manager = "manager"
    case cashier = "cashier"
    case barista = "barista"
    case server = "server"
    case kitchen = "kitchen"
    case other = "other"

    var displayName: String {
        switch self {
        case .manager: return "Manager"
        case .cashier: return "Cashier"
        case .barista: return "Barista"
        case .server: return "Server"
        case .kitchen: return "Kitchen"
        case .other: return "Other"
        }
    }
}

struct ShiftSummary: Equatable, Sendable {
    let staffId: String
    let totalSales: Int
    let totalRevenue: Double
    let hoursWorked: Double
    let shiftsCount: Int

    var formattedRevenue: String {
        "£\(String(format: "%.2f", totalRevenue))"
    }

    var formattedHours: String {
        String(format: "%.1f hrs", hoursWorked)
    }
}
```

### NFCCard

```swift
import Foundation

struct NFCCard: Identifiable, Equatable, Hashable, Sendable {
    let id: String // uid
    let uid: String
    let uidDisplay: String
    let walletAddress: String
    let cardName: String?
    let status: NFCCardStatus
    let createdAt: Date?

    var displayName: String {
        cardName ?? "Card \(uidDisplay.suffix(4))"
    }

    var isActive: Bool {
        status == .active
    }
}

enum NFCCardStatus: String, CaseIterable, Sendable {
    case active = "active"
    case inactive = "inactive"
    case blocked = "blocked"

    var displayName: String {
        switch self {
        case .active: return "Active"
        case .inactive: return "Inactive"
        case .blocked: return "Blocked"
        }
    }
}
```

### Wallet

```swift
import Foundation

struct WalletStatus: Equatable, Sendable {
    let address: String
    let funded: Bool
    let xrpBalance: Double
    let rlusdTrustline: Bool
    let rlusdBalance: Double
    let autoSigningEnabled: Bool

    var formattedXRP: String {
        "\(String(format: "%.6f", xrpBalance)) XRP"
    }

    var formattedRLUSD: String {
        "\(String(format: "%.2f", rlusdBalance)) RLUSD"
    }

    var isReady: Bool {
        funded && rlusdTrustline
    }

    var setupProgress: WalletSetupProgress {
        if !funded { return .needsFunding }
        if !rlusdTrustline { return .needsTrustline }
        if !autoSigningEnabled { return .ready }
        return .complete
    }
}

enum WalletSetupProgress: CaseIterable, Sendable {
    case needsFunding
    case needsTrustline
    case ready
    case complete

    var displayName: String {
        switch self {
        case .needsFunding: return "Needs Funding"
        case .needsTrustline: return "Needs RLUSD Trustline"
        case .ready: return "Ready"
        case .complete: return "Complete"
        }
    }

    var stepNumber: Int {
        switch self {
        case .needsFunding: return 1
        case .needsTrustline: return 2
        case .ready: return 3
        case .complete: return 4
        }
    }
}
```

### InventoryHistory

```swift
import Foundation

struct InventoryHistoryEntry: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let productId: String
    let productName: String?
    let previousQuantity: Int
    let newQuantity: Int
    let adjustment: Int
    let reason: InventoryAdjustmentReason
    let notes: String?
    let createdAt: Date
    let createdBy: String?

    var isPositive: Bool { adjustment > 0 }
    var isNegative: Bool { adjustment < 0 }

    var formattedAdjustment: String {
        adjustment > 0 ? "+\(adjustment)" : "\(adjustment)"
    }
}

enum InventoryAdjustmentReason: String, CaseIterable, Sendable {
    case sale = "sale"
    case restock = "restock"
    case adjustment = "adjustment"
    case `return` = "return"
    case damage = "damage"
    case expired = "expired"
    case transfer = "transfer"
    case initial = "initial"

    var displayName: String {
        switch self {
        case .sale: return "Sale"
        case .restock: return "Restock"
        case .adjustment: return "Adjustment"
        case .return: return "Return"
        case .damage: return "Damage"
        case .expired: return "Expired"
        case .transfer: return "Transfer"
        case .initial: return "Initial Stock"
        }
    }

    var icon: String {
        switch self {
        case .sale: return "cart"
        case .restock: return "shippingbox"
        case .adjustment: return "pencil"
        case .return: return "arrow.uturn.backward"
        case .damage: return "exclamationmark.triangle"
        case .expired: return "clock"
        case .transfer: return "arrow.left.arrow.right"
        case .initial: return "plus.circle"
        }
    }
}
```

### Customer

```swift
import Foundation

struct Customer: Identifiable, Equatable, Hashable, Sendable {
    let id: String // wallet address
    let walletAddress: String
    let name: String?
    let email: String?
    let phone: String?
    let logoUrl: String?
    let milestones: CustomerMilestones
    let createdAt: Date?
}

struct CustomerMilestones: Equatable, Hashable, Sendable {
    let firstCardLinkedAt: Date?
    let firstPaymentAt: Date?
    let autoSignEnabledAt: Date?

    var hasLinkedCard: Bool { firstCardLinkedAt != nil }
    var hasMadePayment: Bool { firstPaymentAt != nil }
    var hasAutoSign: Bool { autoSignEnabledAt != nil }

    var completedCount: Int {
        [hasLinkedCard, hasMadePayment, hasAutoSign].filter { $0 }.count
    }

    var totalCount: Int { 3 }
}
```

### Stats

```swift
import Foundation

struct StoreStats: Equatable, Sendable {
    let totalRevenue: Double
    let totalSales: Int
    let todayRevenue: Double
    let todaySales: Int

    var formattedTotalRevenue: String {
        "£\(String(format: "%.2f", totalRevenue))"
    }

    var formattedTodayRevenue: String {
        "£\(String(format: "%.2f", todayRevenue))"
    }

    static var empty: StoreStats {
        StoreStats(totalRevenue: 0, totalSales: 0, todayRevenue: 0, todaySales: 0)
    }
}

struct ActivityItem: Identifiable, Equatable, Sendable {
    let id: String
    let type: ActivityType
    let title: String
    let subtitle: String?
    let amount: Double?
    let timestamp: Date

    var formattedAmount: String? {
        guard let amount = amount else { return nil }
        return "£\(String(format: "%.2f", amount))"
    }

    var relativeTime: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: timestamp, relativeTo: Date())
    }
}

enum ActivityType: String, Sendable {
    case payment
    case refund
    case cardLinked
    case staffClockIn
    case staffClockOut
    case productCreated
    case lowStock
}
```

## Mappers

### ProductMapper

```swift
enum ProductMapper {
    static func toDomain(_ dto: ProductDTO) -> Product {
        Product(
            id: dto.productId,
            storeId: "", // Set from context
            name: dto.name,
            price: dto.price,
            sku: dto.sku,
            category: dto.category,
            emoji: dto.emoji,
            iconId: dto.iconId,
            imageUrl: dto.imageUrl,
            barcode: dto.barcode,
            trackStock: dto.trackStock,
            quantity: dto.quantity,
            lowStockThreshold: dto.lowStockThreshold,
            allowNegativeStock: dto.allowNegativeStock ?? false,
            createdAt: nil
        )
    }

    static func toDTO(_ input: ProductInput) -> CreateProductInput {
        CreateProductInput(
            walletAddress: "", // Set from context
            name: input.name,
            price: input.price,
            sku: input.sku,
            category: input.category,
            emoji: input.emoji,
            iconId: input.iconId,
            imageUrl: input.imageUrl,
            barcode: input.barcode,
            trackStock: input.trackStock,
            quantity: input.quantity,
            lowStockThreshold: input.lowStockThreshold
        )
    }
}

struct ProductInput {
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
```

### Other Mappers Follow Same Pattern

```swift
enum StoreMapper {
    static func toDomain(_ dto: StoreDTO) -> Store {
        Store(
            id: dto.storeId,
            name: dto.storeName,
            walletAddress: dto.walletAddress,
            logoUrl: dto.logoUrl,
            tier: StoreTier(rawValue: dto.tier ?? "free") ?? .free,
            createdAt: ISO8601DateFormatter().date(from: dto.createdAt ?? "")
        )
    }
}

enum ReceiptMapper {
    static func toDomain(_ dto: ReceiptDTO) -> Receipt {
        Receipt(
            id: dto.receiptId,
            storeId: dto.storeId,
            storeName: dto.storeName,
            items: dto.items.map { PaymentItem(id: UUID().uuidString, productId: $0.productId, name: $0.name, price: $0.price, quantity: $0.quantity) },
            subtotal: dto.subtotal,
            tip: dto.tip,
            total: dto.total,
            txHash: dto.txHash,
            staffId: dto.staffId,
            staffName: dto.staffName,
            createdAt: ISO8601DateFormatter().date(from: dto.createdAt) ?? Date()
        )
    }
}

enum StaffMapper {
    static func toDomain(_ dto: StaffDTO) -> Staff {
        Staff(
            id: dto.staffId,
            storeId: "", // Set from context
            name: dto.name,
            role: StaffRole(rawValue: dto.role) ?? .other,
            photoUrl: dto.photoUrl,
            isClockedIn: dto.isClockedIn,
            clockedInAt: dto.clockedInAt.flatMap { ISO8601DateFormatter().date(from: $0) },
            createdAt: nil
        )
    }
}

enum NFCCardMapper {
    static func toDomain(_ dto: NFCCardDTO) -> NFCCard {
        NFCCard(
            id: dto.uid,
            uid: dto.uid,
            uidDisplay: dto.uidDisplay ?? dto.uid,
            walletAddress: dto.wallet,
            cardName: dto.cardName,
            status: NFCCardStatus(rawValue: dto.status) ?? .active,
            createdAt: dto.createdAt.flatMap { ISO8601DateFormatter().date(from: $0) }
        )
    }
}

enum InventoryHistoryMapper {
    static func toDomain(_ dto: InventoryHistoryDTO) -> InventoryHistoryEntry {
        InventoryHistoryEntry(
            id: dto.historyId,
            productId: dto.productId,
            productName: dto.productName,
            previousQuantity: dto.previousQuantity,
            newQuantity: dto.newQuantity,
            adjustment: dto.adjustment,
            reason: InventoryAdjustmentReason(rawValue: dto.reason) ?? .adjustment,
            notes: dto.notes,
            createdAt: ISO8601DateFormatter().date(from: dto.createdAt) ?? Date(),
            createdBy: dto.createdBy
        )
    }
}
```

## Mock Data for Previews

```swift
#if DEBUG
extension Product {
    static func mock(
        id: String = UUID().uuidString,
        name: String = "Cappuccino",
        price: Double = 3.50,
        trackStock: Bool = true,
        quantity: Int = 50
    ) -> Product {
        Product(
            id: id,
            storeId: "store_123",
            name: name,
            price: price,
            sku: "SKU001",
            category: "Hot Drinks",
            emoji: "☕",
            iconId: nil,
            imageUrl: nil,
            barcode: "5901234123457",
            trackStock: trackStock,
            quantity: quantity,
            lowStockThreshold: 10,
            allowNegativeStock: false,
            createdAt: Date()
        )
    }
}

extension Store {
    static func mock() -> Store {
        Store(
            id: "store_123",
            name: "Coffee Shop",
            walletAddress: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            logoUrl: nil,
            tier: .starter,
            createdAt: Date()
        )
    }
}

extension Receipt {
    static func mock() -> Receipt {
        Receipt(
            id: "receipt_123",
            storeId: "store_123",
            storeName: "Coffee Shop",
            items: [
                PaymentItem(productId: "prod_1", name: "Cappuccino", price: 3.50, quantity: 2),
                PaymentItem(productId: "prod_2", name: "Croissant", price: 2.50, quantity: 1)
            ],
            subtotal: 9.50,
            tip: 1.00,
            total: 10.50,
            txHash: "ABC123DEF456",
            staffId: nil,
            staffName: nil,
            createdAt: Date()
        )
    }
}

extension Staff {
    static func mock() -> Staff {
        Staff(
            id: "staff_123",
            storeId: "store_123",
            name: "John Smith",
            role: .barista,
            photoUrl: nil,
            isClockedIn: true,
            clockedInAt: Date().addingTimeInterval(-3600),
            createdAt: Date()
        )
    }
}
#endif
```
