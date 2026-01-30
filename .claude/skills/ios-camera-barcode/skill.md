# iOS Camera & Barcode Scanning Skill

AVFoundation + Vision framework patterns for YesAllOfUs iOS app - barcode scanning for POS and inventory.

## Info.plist Requirements

```xml
<key>NSCameraUsageDescription</key>
<string>YesAllOfUs uses the camera to scan product barcodes for quick checkout and inventory management</string>
```

## Barcode Scanner Manager

```swift
import AVFoundation
import Vision
import UIKit

// MARK: - Barcode Types
enum BarcodeType: String, CaseIterable {
    case ean13 = "EAN-13"
    case ean8 = "EAN-8"
    case upca = "UPC-A"
    case upce = "UPC-E"
    case code128 = "Code 128"
    case code39 = "Code 39"
    case qr = "QR Code"
    case dataMatrix = "Data Matrix"

    var avMetadataType: AVMetadataObject.ObjectType {
        switch self {
        case .ean13: return .ean13
        case .ean8: return .ean8
        case .upca: return .upca
        case .upce: return .upce
        case .code128: return .code128
        case .code39: return .code39
        case .qr: return .qr
        case .dataMatrix: return .dataMatrix
        }
    }

    static var productBarcodes: [BarcodeType] {
        [.ean13, .ean8, .upca, .upce, .code128, .code39]
    }

    static var allTypes: [AVMetadataObject.ObjectType] {
        allCases.map { $0.avMetadataType }
    }

    static var productTypes: [AVMetadataObject.ObjectType] {
        productBarcodes.map { $0.avMetadataType }
    }
}

// MARK: - Scan Result
struct BarcodeScanResult: Equatable {
    let value: String
    let type: BarcodeType
    let timestamp: Date

    init(value: String, type: AVMetadataObject.ObjectType) {
        self.value = value
        self.type = BarcodeType.allCases.first { $0.avMetadataType == type } ?? .code128
        self.timestamp = Date()
    }
}

// MARK: - Scanner Errors
enum BarcodeScannerError: LocalizedError {
    case cameraNotAvailable
    case cameraAccessDenied
    case setupFailed(String)

    var errorDescription: String? {
        switch self {
        case .cameraNotAvailable:
            return "Camera is not available on this device"
        case .cameraAccessDenied:
            return "Camera access was denied. Please enable it in Settings."
        case .setupFailed(let reason):
            return "Failed to setup camera: \(reason)"
        }
    }
}

// MARK: - Barcode Scanner
@Observable
final class BarcodeScanner: NSObject {
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var metadataOutput: AVCaptureMetadataOutput?

    var isScanning: Bool = false
    var lastScanResult: BarcodeScanResult?
    var error: BarcodeScannerError?

    private var onScan: ((BarcodeScanResult) -> Void)?
    private var scanCooldown: Bool = false

    // Check camera authorization
    static func checkAuthorization() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            return true
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .video)
        case .denied, .restricted:
            return false
        @unknown default:
            return false
        }
    }

    // Setup capture session
    func setupSession(in view: UIView, onScan: @escaping (BarcodeScanResult) -> Void) throws {
        self.onScan = onScan

        // Check for camera
        guard let device = AVCaptureDevice.default(for: .video) else {
            throw BarcodeScannerError.cameraNotAvailable
        }

        // Create session
        let session = AVCaptureSession()
        session.sessionPreset = .high

        // Add input
        do {
            let input = try AVCaptureDeviceInput(device: device)
            if session.canAddInput(input) {
                session.addInput(input)
            }
        } catch {
            throw BarcodeScannerError.setupFailed(error.localizedDescription)
        }

        // Add metadata output
        let output = AVCaptureMetadataOutput()
        if session.canAddOutput(output) {
            session.addOutput(output)
            output.setMetadataObjectsDelegate(self, queue: .main)
            output.metadataObjectTypes = BarcodeType.productTypes
        }

        // Create preview layer
        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.videoGravity = .resizeAspectFill
        preview.frame = view.bounds
        view.layer.insertSublayer(preview, at: 0)

        self.captureSession = session
        self.previewLayer = preview
        self.metadataOutput = output
    }

    // Start scanning
    func startScanning() {
        guard let session = captureSession, !session.isRunning else { return }

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            session.startRunning()
            DispatchQueue.main.async {
                self?.isScanning = true
            }
        }
    }

    // Stop scanning
    func stopScanning() {
        guard let session = captureSession, session.isRunning else { return }

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            session.stopRunning()
            DispatchQueue.main.async {
                self?.isScanning = false
            }
        }
    }

    // Update preview frame
    func updatePreviewFrame(_ frame: CGRect) {
        previewLayer?.frame = frame
    }

    // Cleanup
    func cleanup() {
        stopScanning()
        previewLayer?.removeFromSuperlayer()
        captureSession = nil
        previewLayer = nil
        metadataOutput = nil
    }

    // Toggle torch
    func toggleTorch() {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch else { return }

        do {
            try device.lockForConfiguration()
            device.torchMode = device.torchMode == .on ? .off : .on
            device.unlockForConfiguration()
        } catch {
            print("Failed to toggle torch: \(error)")
        }
    }

    // Set scan area (for focused scanning)
    func setScanArea(_ rect: CGRect) {
        guard let previewLayer = previewLayer else { return }
        let metadataRect = previewLayer.metadataOutputRectConverted(fromLayerRect: rect)
        metadataOutput?.rectOfInterest = metadataRect
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate
extension BarcodeScanner: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        // Prevent rapid-fire scans
        guard !scanCooldown else { return }

        guard let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let stringValue = metadataObject.stringValue else {
            return
        }

        let result = BarcodeScanResult(value: stringValue, type: metadataObject.type)

        // Skip if same as last scan (within cooldown)
        if let last = lastScanResult, last.value == result.value {
            return
        }

        lastScanResult = result

        // Haptic feedback
        HapticManager.shared.impact(.medium)

        // Notify
        onScan?(result)

        // Cooldown to prevent duplicate scans
        scanCooldown = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            self?.scanCooldown = false
        }
    }
}
```

## Scanner View (UIViewRepresentable)

```swift
import SwiftUI
import AVFoundation

struct BarcodeScannerView: UIViewRepresentable {
    let scanner: BarcodeScanner
    let onScan: (BarcodeScanResult) -> Void

    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .black

        Task { @MainActor in
            do {
                try scanner.setupSession(in: view, onScan: onScan)
                scanner.startScanning()
            } catch {
                print("Scanner setup failed: \(error)")
            }
        }

        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        scanner.updatePreviewFrame(uiView.bounds)
    }

    static func dismantleUIView(_ uiView: UIView, coordinator: ()) {
        // Cleanup handled by scanner.cleanup()
    }
}
```

## Full Scanner Sheet View

```swift
import SwiftUI

struct BarcodeScannerSheet: View {
    @Environment(\.dismiss) private var dismiss

    let onBarcodeScanned: (String) -> Void

    @State private var scanner = BarcodeScanner()
    @State private var hasPermission = false
    @State private var showPermissionDenied = false
    @State private var lastScannedCode: String?
    @State private var torchOn = false

    var body: some View {
        NavigationStack {
            ZStack {
                if hasPermission {
                    // Scanner view
                    BarcodeScannerView(scanner: scanner) { result in
                        handleScan(result)
                    }
                    .ignoresSafeArea()

                    // Overlay
                    scannerOverlay
                } else if showPermissionDenied {
                    permissionDeniedView
                } else {
                    ProgressView("Requesting camera access...")
                }
            }
            .navigationTitle("Scan Barcode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .primaryAction) {
                    Button {
                        torchOn.toggle()
                        scanner.toggleTorch()
                    } label: {
                        Image(systemName: torchOn ? "flashlight.on.fill" : "flashlight.off.fill")
                    }
                }
            }
            .task {
                hasPermission = await BarcodeScanner.checkAuthorization()
                showPermissionDenied = !hasPermission
            }
            .onDisappear {
                scanner.cleanup()
            }
        }
    }

    private var scannerOverlay: some View {
        VStack {
            Spacer()

            // Scan frame
            RoundedRectangle(cornerRadius: 16)
                .stroke(Theme.Colors.primary, lineWidth: 3)
                .frame(width: 280, height: 180)
                .overlay {
                    // Corner accents
                    scanFrameCorners
                }

            Spacer()

            // Instructions
            VStack(spacing: Theme.Spacing.sm) {
                Text("Position barcode within frame")
                    .font(Theme.Typography.body)
                    .foregroundStyle(.white)

                if let code = lastScannedCode {
                    Text("Scanned: \(code)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.success)
                        .padding(.horizontal, Theme.Spacing.md)
                        .padding(.vertical, Theme.Spacing.xs)
                        .background(Color.black.opacity(0.6))
                        .cornerRadius(Theme.CornerRadius.small)
                }
            }
            .padding(.bottom, 60)
        }
        .background(
            Color.black.opacity(0.4)
                .ignoresSafeArea()
        )
    }

    private var scanFrameCorners: some View {
        GeometryReader { geo in
            let cornerLength: CGFloat = 30
            let lineWidth: CGFloat = 4

            // Top left
            Path { path in
                path.move(to: CGPoint(x: 0, y: cornerLength))
                path.addLine(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: cornerLength, y: 0))
            }
            .stroke(Theme.Colors.primary, lineWidth: lineWidth)

            // Top right
            Path { path in
                path.move(to: CGPoint(x: geo.size.width - cornerLength, y: 0))
                path.addLine(to: CGPoint(x: geo.size.width, y: 0))
                path.addLine(to: CGPoint(x: geo.size.width, y: cornerLength))
            }
            .stroke(Theme.Colors.primary, lineWidth: lineWidth)

            // Bottom left
            Path { path in
                path.move(to: CGPoint(x: 0, y: geo.size.height - cornerLength))
                path.addLine(to: CGPoint(x: 0, y: geo.size.height))
                path.addLine(to: CGPoint(x: cornerLength, y: geo.size.height))
            }
            .stroke(Theme.Colors.primary, lineWidth: lineWidth)

            // Bottom right
            Path { path in
                path.move(to: CGPoint(x: geo.size.width - cornerLength, y: geo.size.height))
                path.addLine(to: CGPoint(x: geo.size.width, y: geo.size.height))
                path.addLine(to: CGPoint(x: geo.size.width, y: geo.size.height - cornerLength))
            }
            .stroke(Theme.Colors.primary, lineWidth: lineWidth)
        }
    }

    private var permissionDeniedView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "camera.fill")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.textSecondary)

            Text("Camera Access Required")
                .font(Theme.Typography.title2)

            Text("Please enable camera access in Settings to scan barcodes.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            PrimaryButton(title: "Open Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
        }
        .padding()
    }

    private func handleScan(_ result: BarcodeScanResult) {
        lastScannedCode = result.value

        // Dismiss and return result
        onBarcodeScanned(result.value)
        dismiss()
    }
}
```

## Inline Scanner Component

For embedding scanner in existing views (e.g., inventory page):

```swift
import SwiftUI

struct InlineBarcodeScannerView: View {
    let onScan: (String) -> Void

    @State private var scanner = BarcodeScanner()
    @State private var hasPermission = false
    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 0) {
            // Toggle button
            Button {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                    if isExpanded {
                        scanner.startScanning()
                    } else {
                        scanner.stopScanning()
                    }
                }
            } label: {
                HStack {
                    Image(systemName: "barcode.viewfinder")
                    Text(isExpanded ? "Close Scanner" : "Scan Barcode")
                }
                .font(Theme.Typography.button)
                .foregroundStyle(Theme.Colors.primary)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Theme.Colors.primary.opacity(0.1))
                .cornerRadius(Theme.CornerRadius.medium)
            }

            // Expandable scanner
            if isExpanded {
                ZStack {
                    if hasPermission {
                        BarcodeScannerView(scanner: scanner) { result in
                            HapticManager.shared.success()
                            onScan(result.value)

                            // Close after scan
                            withAnimation {
                                isExpanded = false
                                scanner.stopScanning()
                            }
                        }
                    } else {
                        VStack {
                            Text("Camera access required")
                                .font(Theme.Typography.body)
                            Button("Open Settings") {
                                if let url = URL(string: UIApplication.openSettingsURLString) {
                                    UIApplication.shared.open(url)
                                }
                            }
                        }
                    }
                }
                .frame(height: 200)
                .cornerRadius(Theme.CornerRadius.large)
                .clipped()
                .padding(.top, Theme.Spacing.sm)
            }
        }
        .task {
            hasPermission = await BarcodeScanner.checkAuthorization()
        }
        .onDisappear {
            scanner.cleanup()
        }
    }
}
```

## POS Integration

```swift
import SwiftUI

struct POSView: View {
    @State private var viewModel: POSViewModel
    @State private var showScanner = false

    var body: some View {
        VStack {
            // Product grid
            ProductGridView(
                products: viewModel.products,
                onProductTap: viewModel.addToCart
            )

            // Cart summary
            CartSummaryView(cart: viewModel.cart)
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showScanner = true
                } label: {
                    Image(systemName: "barcode.viewfinder")
                }
            }
        }
        .sheet(isPresented: $showScanner) {
            BarcodeScannerSheet { barcode in
                viewModel.handleScannedBarcode(barcode)
            }
        }
    }
}

// ViewModel handling
@Observable
final class POSViewModel {
    var products: [Product] = []
    var cart: Cart = Cart()

    func handleScannedBarcode(_ barcode: String) {
        // Find product by barcode
        if let product = products.first(where: { $0.barcode == barcode }) {
            addToCart(product)
            HapticManager.shared.success()
        } else {
            // Product not found
            HapticManager.shared.error()
            showProductNotFoundAlert(barcode: barcode)
        }
    }

    func addToCart(_ product: Product) {
        cart.addItem(product)
    }
}
```

## Inventory Barcode Entry

```swift
import SwiftUI

struct ProductBarcodeField: View {
    @Binding var barcode: String
    @State private var showScanner = false

    var body: some View {
        HStack {
            TextField("Barcode (optional)", text: $barcode)
                .textFieldStyle(.roundedBorder)
                .keyboardType(.numberPad)

            Button {
                showScanner = true
            } label: {
                Image(systemName: "barcode.viewfinder")
                    .font(.title2)
                    .foregroundStyle(Theme.Colors.primary)
            }
        }
        .sheet(isPresented: $showScanner) {
            BarcodeScannerSheet { scannedBarcode in
                barcode = scannedBarcode
            }
        }
    }
}

// Usage in product form
struct ProductFormView: View {
    @State private var name = ""
    @State private var price = ""
    @State private var barcode = ""

    var body: some View {
        Form {
            Section("Product Details") {
                TextField("Name", text: $name)
                TextField("Price", text: $price)
                    .keyboardType(.decimalPad)
            }

            Section("Inventory") {
                ProductBarcodeField(barcode: $barcode)
            }
        }
    }
}
```

## Continuous Scanning Mode

For rapid inventory counting:

```swift
import SwiftUI

struct ContinuousScanView: View {
    @Environment(\.dismiss) private var dismiss

    let onScansComplete: ([String]) -> Void

    @State private var scanner = BarcodeScanner()
    @State private var scannedCodes: [String] = []
    @State private var hasPermission = false

    var body: some View {
        NavigationStack {
            VStack {
                if hasPermission {
                    // Scanner
                    BarcodeScannerView(scanner: scanner) { result in
                        if !scannedCodes.contains(result.value) {
                            scannedCodes.append(result.value)
                            HapticManager.shared.impact(.light)
                        }
                    }
                    .frame(height: 250)
                    .cornerRadius(Theme.CornerRadius.large)
                    .padding()

                    // Scanned items list
                    List {
                        ForEach(scannedCodes, id: \.self) { code in
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Theme.Colors.success)
                                Text(code)
                                    .font(Theme.Typography.mono)
                            }
                        }
                        .onDelete { indexSet in
                            scannedCodes.remove(atOffsets: indexSet)
                        }
                    }

                    // Count
                    Text("\(scannedCodes.count) items scanned")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .padding()
                }
            }
            .navigationTitle("Scan Items")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        onScansComplete(scannedCodes)
                        dismiss()
                    }
                    .disabled(scannedCodes.isEmpty)
                }
            }
            .task {
                hasPermission = await BarcodeScanner.checkAuthorization()
                if hasPermission {
                    scanner.startScanning()
                }
            }
            .onDisappear {
                scanner.cleanup()
            }
        }
    }
}
```

## Testing/Preview Support

```swift
#if DEBUG
// Mock scanner for SwiftUI previews
struct MockBarcodeScannerView: View {
    let onScan: (BarcodeScanResult) -> Void

    var body: some View {
        VStack {
            Image(systemName: "barcode.viewfinder")
                .font(.system(size: 100))
                .foregroundStyle(.gray)

            Text("Camera Preview")
                .foregroundStyle(.gray)

            Button("Simulate Scan") {
                let mockResult = BarcodeScanResult(
                    value: "1234567890123",
                    type: .ean13
                )
                onScan(mockResult)
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
    }
}

struct BarcodeScannerSheet_Previews: PreviewProvider {
    static var previews: some View {
        BarcodeScannerSheet { barcode in
            print("Scanned: \(barcode)")
        }
    }
}
#endif
```

## Best Practices

1. **Always check authorization** before showing scanner UI
2. **Use haptic feedback** on successful scans
3. **Implement cooldown** to prevent duplicate rapid scans
4. **Clean up resources** in onDisappear
5. **Handle torch** for low-light conditions
6. **Show visual feedback** for scan area
7. **Support manual entry** as fallback
8. **Test on real devices** - simulator doesn't support camera
