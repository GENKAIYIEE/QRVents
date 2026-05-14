import QRCode from "qrcode"

export async function generateQRCodeImage(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    width: 300,
    margin: 2,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  })
}

export function generateQRValue(): string {
  return crypto.randomUUID()
}
