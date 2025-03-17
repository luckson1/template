import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Generate a unique filename with user ID to avoid conflicts
    const userId = session.user.id;
    const filename = `profile-${userId}-${Date.now()}.${file.name.split(".").pop()}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

// Set the maximum file size (4MB)
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "4mb",
  },
};
