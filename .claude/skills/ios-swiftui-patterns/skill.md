# iOS SwiftUI Patterns Skill

## Overview
This skill documents SwiftUI patterns, theming, and reusable components for the YesAllOfUs iOS app, matching the web app's visual design.

## Theme System

### Colors

```swift
import SwiftUI

extension Color {
    // MARK: - Brand Colors
    static let brandEmerald = Color(hex: "10B981")
    static let brandEmeraldLight = Color(hex: "34D399")
    static let brandEmeraldDark = Color(hex: "059669")

    // MARK: - Background Colors
    static let bgPrimary = Color(hex: "0A0A0A")
    static let bgSecondary = Color(hex: "18181B")
    static let bgTertiary = Color(hex: "27272A")
    static let bgCard = Color(hex: "1F1F23")

    // MARK: - Border Colors
    static let borderPrimary = Color(hex: "27272A")
    static let borderSecondary = Color(hex: "3F3F46")
    static let borderActive = Color.brandEmerald

    // MARK: - Text Colors
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "A1A1AA")
    static let textTertiary = Color(hex: "71717A")
    static let textMuted = Color(hex: "52525B")

    // MARK: - Status Colors
    static let statusSuccess = Color(hex: "10B981")
    static let statusWarning = Color(hex: "F59E0B")
    static let statusError = Color(hex: "EF4444")
    static let statusInfo = Color(hex: "3B82F6")

    // MARK: - Semantic Colors
    static let priceColor = Color.brandEmerald
    static let tipColor = Color(hex: "8B5CF6")

    // MARK: - Init from Hex
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
```

### Typography

```swift
import SwiftUI

extension Font {
    // MARK: - Display
    static let displayLarge = Font.system(size: 48, weight: .bold)
    static let displayMedium = Font.system(size: 36, weight: .bold)
    static let displaySmall = Font.system(size: 28, weight: .bold)

    // MARK: - Headings
    static let headingLarge = Font.system(size: 24, weight: .bold)
    static let headingMedium = Font.system(size: 20, weight: .semibold)
    static let headingSmall = Font.system(size: 18, weight: .semibold)

    // MARK: - Body
    static let bodyLarge = Font.system(size: 16, weight: .regular)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
    static let bodySmall = Font.system(size: 12, weight: .regular)

    // MARK: - Labels
    static let labelLarge = Font.system(size: 14, weight: .medium)
    static let labelMedium = Font.system(size: 12, weight: .medium)
    static let labelSmall = Font.system(size: 10, weight: .medium)

    // MARK: - Monospace (for prices, codes)
    static let priceLarge = Font.system(size: 48, weight: .bold, design: .rounded)
    static let priceMedium = Font.system(size: 24, weight: .bold, design: .rounded)
    static let priceSmall = Font.system(size: 16, weight: .semibold, design: .rounded)
    static let code = Font.system(size: 14, weight: .medium, design: .monospaced)
}
```

### Spacing

```swift
import SwiftUI

enum Spacing {
    static let xxs: CGFloat = 2
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let xxxl: CGFloat = 48
}

enum CornerRadius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let full: CGFloat = 9999
}
```

## Common View Modifiers

### Card Style

```swift
import SwiftUI

struct CardStyle: ViewModifier {
    var isSelected: Bool = false
    var isDisabled: Bool = false

    func body(content: Content) -> some View {
        content
            .background(Color.bgCard)
            .cornerRadius(CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg)
                    .stroke(
                        isSelected ? Color.borderActive : Color.borderPrimary,
                        lineWidth: 1
                    )
            )
            .opacity(isDisabled ? 0.5 : 1)
    }
}

extension View {
    func cardStyle(isSelected: Bool = false, isDisabled: Bool = false) -> some View {
        modifier(CardStyle(isSelected: isSelected, isDisabled: isDisabled))
    }
}
```

### Input Field Style

```swift
struct InputFieldStyle: ViewModifier {
    var isError: Bool = false

    func body(content: Content) -> some View {
        content
            .padding(Spacing.md)
            .background(Color.bgSecondary)
            .cornerRadius(CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .stroke(
                        isError ? Color.statusError : Color.borderPrimary,
                        lineWidth: 1
                    )
            )
    }
}

extension View {
    func inputFieldStyle(isError: Bool = false) -> some View {
        modifier(InputFieldStyle(isError: isError))
    }
}
```

### Shake Effect (for errors)

```swift
struct ShakeEffect: GeometryEffect {
    var amount: CGFloat = 10
    var shakesPerUnit = 3
    var animatableData: CGFloat

    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(translationX:
            amount * sin(animatableData * .pi * CGFloat(shakesPerUnit)),
            y: 0))
    }
}

extension View {
    func shake(trigger: Bool) -> some View {
        modifier(ShakeModifier(trigger: trigger))
    }
}

struct ShakeModifier: ViewModifier {
    let trigger: Bool
    @State private var shakeAmount: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .modifier(ShakeEffect(animatableData: shakeAmount))
            .onChange(of: trigger) { _, newValue in
                if newValue {
                    withAnimation(.linear(duration: 0.4)) {
                        shakeAmount = 1
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                        shakeAmount = 0
                    }
                }
            }
    }
}
```

### Pulse Effect (for scanning)

```swift
struct PulseEffect: ViewModifier {
    @State private var isAnimating = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isAnimating ? 1.1 : 1.0)
            .opacity(isAnimating ? 0.8 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                    isAnimating = true
                }
            }
    }
}

extension View {
    func pulse() -> some View {
        modifier(PulseEffect())
    }
}
```

## Reusable Components

### Primary Button

```swift
struct PrimaryButton: View {
    let title: String
    let icon: String?
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void

    init(
        _ title: String,
        icon: String? = nil,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.sm) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .black))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                    }
                    Text(title)
                        .font(.labelLarge)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Color.brandEmerald)
            .foregroundColor(.black)
            .fontWeight(.bold)
            .cornerRadius(CornerRadius.md)
        }
        .disabled(isLoading || isDisabled)
        .opacity(isLoading || isDisabled ? 0.6 : 1)
    }
}
```

### Secondary Button

```swift
struct SecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(_ title: String, icon: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.sm) {
                if let icon = icon {
                    Image(systemName: icon)
                }
                Text(title)
                    .font(.labelLarge)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Color.bgTertiary)
            .foregroundColor(.textPrimary)
            .cornerRadius(CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .stroke(Color.borderPrimary, lineWidth: 1)
            )
        }
    }
}
```

### Amount Display

```swift
struct AmountDisplay: View {
    let amount: Double
    let label: String?
    let size: Size

    enum Size {
        case small, medium, large

        var font: Font {
            switch self {
            case .small: return .priceSmall
            case .medium: return .priceMedium
            case .large: return .priceLarge
            }
        }

        var labelFont: Font {
            switch self {
            case .small: return .labelSmall
            case .medium: return .labelMedium
            case .large: return .labelLarge
            }
        }
    }

    init(_ amount: Double, label: String? = nil, size: Size = .medium) {
        self.amount = amount
        self.label = label
        self.size = size
    }

    var body: some View {
        VStack(spacing: Spacing.xs) {
            if let label = label {
                Text(label)
                    .font(size.labelFont)
                    .foregroundColor(.textSecondary)
            }
            Text("£\(String(format: "%.2f", amount))")
                .font(size.font)
                .foregroundColor(.textPrimary)
        }
    }
}
```

### Loading View

```swift
struct LoadingView: View {
    let message: String?

    init(_ message: String? = nil) {
        self.message = message
    }

    var body: some View {
        VStack(spacing: Spacing.lg) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .brandEmerald))
                .scaleEffect(1.2)

            if let message = message {
                Text(message)
                    .font(.bodyMedium)
                    .foregroundColor(.textSecondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.bgPrimary)
    }
}
```

### Error View

```swift
struct ErrorView: View {
    let error: AppError
    let retryAction: (() -> Void)?

    init(_ error: AppError, retry: (() -> Void)? = nil) {
        self.error = error
        self.retryAction = retry
    }

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.statusError)

            Text("Something went wrong")
                .font(.headingMedium)
                .foregroundColor(.textPrimary)

            Text(error.userMessage)
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)

            if let retry = retryAction {
                SecondaryButton("Try Again", icon: "arrow.clockwise", action: retry)
                    .frame(width: 160)
            }
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.bgPrimary)
    }
}
```

### Empty State View

```swift
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    let action: (title: String, handler: () -> Void)?

    init(
        icon: String,
        title: String,
        message: String,
        action: (String, () -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.message = message
        self.action = action
    }

    var body: some View {
        VStack(spacing: Spacing.lg) {
            Image(systemName: icon)
                .font(.system(size: 56))
                .foregroundColor(.textTertiary)

            Text(title)
                .font(.headingMedium)
                .foregroundColor(.textPrimary)

            Text(message)
                .font(.bodyMedium)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)

            if let action = action {
                Button(action: action.handler) {
                    Text(action.title)
                        .font(.labelLarge)
                        .foregroundColor(.brandEmerald)
                }
                .padding(.top, Spacing.sm)
            }
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
```

### Product Card

```swift
struct ProductCard: View {
    let product: Product
    let quantity: Int
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: Spacing.sm) {
                // Icon
                ZStack {
                    productIcon
                        .frame(width: 40, height: 40)

                    // Quantity badge
                    if quantity > 0 {
                        Text("\(quantity)")
                            .font(.labelSmall)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .frame(width: 22, height: 22)
                            .background(Color.brandEmerald)
                            .clipShape(Circle())
                            .offset(x: 16, y: -16)
                    }

                    // Out of stock badge
                    if product.isOutOfStock {
                        Text("OUT")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.statusError)
                            .cornerRadius(4)
                            .offset(x: 16, y: -16)
                    }

                    // Low stock badge
                    if product.isLowStock && !product.isOutOfStock {
                        Text("\(product.quantity)")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.statusWarning)
                            .cornerRadius(4)
                            .offset(x: -16, y: -16)
                    }
                }

                // Name
                Text(product.name)
                    .font(.labelMedium)
                    .foregroundColor(product.isOutOfStock ? .textTertiary : .textPrimary)
                    .lineLimit(1)

                // Price
                Text(product.formattedPrice)
                    .font(.priceSmall)
                    .foregroundColor(product.isOutOfStock ? .textTertiary : .priceColor)
            }
            .frame(maxWidth: .infinity)
            .padding(Spacing.md)
            .background(quantity > 0 ? Color.brandEmerald.opacity(0.1) : Color.bgCard)
            .cornerRadius(CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg)
                    .stroke(
                        product.isOutOfStock ? Color.statusError.opacity(0.5) :
                        product.isLowStock ? Color.statusWarning.opacity(0.5) :
                        quantity > 0 ? Color.brandEmerald :
                        Color.borderPrimary,
                        lineWidth: 1
                    )
            )
            .opacity(product.isOutOfStock ? 0.6 : 1)
        }
        .disabled(product.isOutOfStock)
    }

    @ViewBuilder
    private var productIcon: some View {
        switch product.displayIcon {
        case .image(let url):
            AsyncImage(url: URL(string: url)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .cover)
            } placeholder: {
                Color.bgTertiary
            }
            .frame(width: 40, height: 40)
            .cornerRadius(CornerRadius.sm)
            .grayscale(product.isOutOfStock ? 1 : 0)

        case .icon(let iconId):
            // Use your icon system here
            Image(systemName: "cup.and.saucer.fill")
                .font(.title2)
                .foregroundColor(product.isOutOfStock ? .textTertiary : .brandEmerald)

        case .emoji(let emoji):
            Text(emoji)
                .font(.title)
                .grayscale(product.isOutOfStock ? 1 : 0)
        }
    }
}
```

### Stock Badge

```swift
struct StockBadge: View {
    let status: StockStatus
    let quantity: Int?

    var body: some View {
        HStack(spacing: Spacing.xs) {
            Circle()
                .fill(badgeColor)
                .frame(width: 6, height: 6)

            if let quantity = quantity, status != .notTracked {
                Text("\(quantity) in stock")
                    .font(.labelSmall)
            } else {
                Text(status.displayName)
                    .font(.labelSmall)
            }
        }
        .foregroundColor(badgeColor)
        .padding(.horizontal, Spacing.sm)
        .padding(.vertical, Spacing.xs)
        .background(badgeColor.opacity(0.15))
        .cornerRadius(CornerRadius.full)
    }

    private var badgeColor: Color {
        switch status {
        case .notTracked: return .textTertiary
        case .inStock: return .statusSuccess
        case .low: return .statusWarning
        case .outOfStock: return .statusError
        }
    }
}
```

### Alert Banner

```swift
struct AlertBanner: View {
    let type: AlertType
    let message: String
    let action: (title: String, handler: () -> Void)?

    enum AlertType {
        case info, success, warning, error

        var icon: String {
            switch self {
            case .info: return "info.circle"
            case .success: return "checkmark.circle"
            case .warning: return "exclamationmark.triangle"
            case .error: return "xmark.circle"
            }
        }

        var color: Color {
            switch self {
            case .info: return .statusInfo
            case .success: return .statusSuccess
            case .warning: return .statusWarning
            case .error: return .statusError
            }
        }
    }

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: type.icon)
                .foregroundColor(type.color)

            Text(message)
                .font(.bodySmall)
                .foregroundColor(.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            if let action = action {
                Button(action: action.handler) {
                    Text(action.title)
                        .font(.labelSmall)
                        .foregroundColor(.textSecondary)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, Spacing.xs)
                        .background(Color.bgTertiary)
                        .cornerRadius(CornerRadius.sm)
                }
            }
        }
        .padding(Spacing.md)
        .background(type.color.opacity(0.1))
        .cornerRadius(CornerRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: CornerRadius.md)
                .stroke(type.color.opacity(0.3), lineWidth: 1)
        )
    }
}
```

### NFC Animation View

```swift
struct NFCAnimationView: View {
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            // Outer pulse rings
            ForEach(0..<3) { index in
                Circle()
                    .stroke(Color.brandEmerald.opacity(0.3), lineWidth: 2)
                    .frame(width: 160 + CGFloat(index * 40), height: 160 + CGFloat(index * 40))
                    .scaleEffect(isAnimating ? 1.2 : 1.0)
                    .opacity(isAnimating ? 0 : 0.6)
                    .animation(
                        .easeOut(duration: 1.5)
                        .repeatForever(autoreverses: false)
                        .delay(Double(index) * 0.3),
                        value: isAnimating
                    )
            }

            // Center icon
            Circle()
                .fill(Color.brandEmerald.opacity(0.2))
                .frame(width: 140, height: 140)

            Image(systemName: "wave.3.right")
                .font(.system(size: 48))
                .foregroundColor(.brandEmerald)
                .rotationEffect(.degrees(-45))
        }
        .onAppear {
            isAnimating = true
        }
    }
}
```

## List Patterns

### Pull to Refresh

```swift
struct RefreshableListExample: View {
    @State private var items: [String] = []
    @State private var isLoading = true

    var body: some View {
        List {
            ForEach(items, id: \.self) { item in
                Text(item)
            }
        }
        .refreshable {
            await loadItems()
        }
        .overlay {
            if isLoading {
                LoadingView()
            } else if items.isEmpty {
                EmptyStateView(
                    icon: "doc.text",
                    title: "No items",
                    message: "Pull to refresh"
                )
            }
        }
    }

    private func loadItems() async {
        // Load items...
    }
}
```

### Swipe Actions

```swift
struct SwipeActionsExample: View {
    var body: some View {
        List {
            ForEach(products) { product in
                ProductRow(product: product)
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button(role: .destructive) {
                            deleteProduct(product)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }

                        Button {
                            editProduct(product)
                        } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                        .tint(.blue)
                    }
            }
        }
    }
}
```

## Form Patterns

### Validated Text Field

```swift
struct ValidatedTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    let error: String?
    let keyboardType: UIKeyboardType

    init(
        _ label: String,
        placeholder: String = "",
        text: Binding<String>,
        error: String? = nil,
        keyboardType: UIKeyboardType = .default
    ) {
        self.label = label
        self.placeholder = placeholder
        self._text = text
        self.error = error
        self.keyboardType = keyboardType
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text(label)
                .font(.labelMedium)
                .foregroundColor(.textSecondary)

            TextField(placeholder, text: $text)
                .font(.bodyMedium)
                .foregroundColor(.textPrimary)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
                .inputFieldStyle(isError: error != nil)

            if let error = error {
                Text(error)
                    .font(.labelSmall)
                    .foregroundColor(.statusError)
            }
        }
    }
}
```

### Toggle Row

```swift
struct ToggleRow: View {
    let title: String
    let subtitle: String?
    @Binding var isOn: Bool

    var body: some View {
        Toggle(isOn: $isOn) {
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text(title)
                    .font(.bodyMedium)
                    .foregroundColor(.textPrimary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                }
            }
        }
        .tint(.brandEmerald)
    }
}
```

## Sheet Patterns

### Bottom Sheet

```swift
struct BottomSheetModifier<SheetContent: View>: ViewModifier {
    @Binding var isPresented: Bool
    let detents: Set<PresentationDetent>
    let showDragIndicator: Bool
    @ViewBuilder let sheetContent: () -> SheetContent

    func body(content: Content) -> some View {
        content
            .sheet(isPresented: $isPresented) {
                sheetContent()
                    .presentationDetents(detents)
                    .presentationDragIndicator(showDragIndicator ? .visible : .hidden)
                    .presentationBackground(Color.bgSecondary)
            }
    }
}

extension View {
    func bottomSheet<Content: View>(
        isPresented: Binding<Bool>,
        detents: Set<PresentationDetent> = [.medium, .large],
        showDragIndicator: Bool = true,
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        modifier(BottomSheetModifier(
            isPresented: isPresented,
            detents: detents,
            showDragIndicator: showDragIndicator,
            sheetContent: content
        ))
    }
}
```

## Haptic Feedback

```swift
enum HapticManager {
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }

    static func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(type)
    }

    static func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }

    // Preset patterns
    static func success() {
        notification(.success)
    }

    static func error() {
        notification(.error)
    }

    static func warning() {
        notification(.warning)
    }

    static func addToCart() {
        impact(.light)
    }

    static func buttonTap() {
        impact(.light)
    }

    static func paymentSuccess() {
        // Custom pattern: vibrate three times
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            generator.impactOccurred()
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            generator.impactOccurred()
        }
    }
}
```
