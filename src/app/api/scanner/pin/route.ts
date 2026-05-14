import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "route ready" })
}

export async function POST() {
  return NextResponse.json({ message: "route ready" })
}
