"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import Image from "next/image";

import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components";
import { handleDownload } from "@/utils/download-image";

export default function ImageProcessor() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);

    const formData = new FormData();
    const file = e.target.files?.[0];
    if (!file) return null;
    formData.append("file", file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setInputImage(e.target?.result as string);
      setOutputImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      setUploadedImageUrl(data.url);
    } else {
      setError(data.error.message);
    }

    setIsLoading(false);
  };

  const processImage = async () => {
    if (!inputImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: uploadedImageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const res = await response.json();
      setOutputImage(res.result.data.image.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onClickDownload = () => {
    if (!outputImage) return;
    handleDownload(outputImage, "image_without_background.png");
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        Background Removal
      </h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
              {inputImage && (
                <div className="relative aspect-square w-full">
                  <Image
                    src={inputImage || "/placeholder.svg"}
                    alt="Input image"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Label>Result</Label>
              {outputImage ? (
                <>
                  <div className="relative aspect-square w-full">
                    <Image
                      src={outputImage || "/placeholder.svg"}
                      alt="Processed image"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button variant={"outline"} onClick={onClickDownload}>
                    Download <Download />
                  </Button>
                </>
              ) : (
                <div className="aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Processed image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4 max-w-4xl mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center mt-6">
        <Button
          onClick={processImage}
          disabled={!uploadedImageUrl || isLoading}
          className="w-full max-w-sm"
        >
          {isLoading ? "Processing..." : "Process Image"}
        </Button>
      </div>
    </div>
  );
}
