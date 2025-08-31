import { ArrowLeft, Eye, Palette } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface ColorPalette {
  name: string;
  description: string;
  category: string;
  colors: {
    name: string;
    hex: string;
    usage: string;
  }[];
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

const PALETTES: ColorPalette[] = [
  {
    name: "Warm Felt",
    description: "Cozy, warm casino feel with rich browns and golden accents",
    category: "Warm Casino Theme",
    colors: [
      { name: "Warm Brown", hex: "#8B4513", usage: "Primary background" },
      { name: "Saddle Brown", hex: "#A0522D", usage: "Secondary background" },
      { name: "Golden", hex: "#DAA520", usage: "Primary accent" },
      { name: "Warm Cream", hex: "#F5F5DC", usage: "Secondary accent" },
      { name: "Dark Brown", hex: "#2F1B14", usage: "Text and borders" },
      { name: "Copper", hex: "#B87333", usage: "Special highlights" },
    ],
    preview: {
      primary: "#8B4513",
      secondary: "#A0522D",
      accent: "#DAA520",
      background: "#8B4513",
      text: "#F5F5DC",
    },
  },
  {
    name: "Golden Hour",
    description:
      "Warm, golden lighting that creates a magical gaming atmosphere",
    category: "Warm Theme",
    colors: [
      { name: "Warm Ivory", hex: "#FFFFF0", usage: "Primary background" },
      { name: "Golden Cream", hex: "#FEF3C7", usage: "Secondary background" },
      { name: "Rich Gold", hex: "#B45309", usage: "Primary accent" },
      { name: "Warm Yellow", hex: "#EAB308", usage: "Secondary accent" },
      { name: "Dark Brown", hex: "#451A03", usage: "Text and borders" },
      { name: "Amber", hex: "#D97706", usage: "Special highlights" },
    ],
    preview: {
      primary: "#FFFFF0",
      secondary: "#FEF3C7",
      accent: "#B45309",
      background: "#FFFFF0",
      text: "#451A03",
    },
  },
  {
    name: "Emerald Felt",
    description:
      "Rich, deep green felt with emerald accents and gold highlights",
    category: "Green Felt Theme",
    colors: [
      { name: "Deep Emerald", hex: "#065F46", usage: "Primary background" },
      { name: "Emerald Green", hex: "#047857", usage: "Secondary background" },
      { name: "Gold", hex: "#D4AF37", usage: "Primary accent" },
      { name: "Light Gold", hex: "#F4E4BC", usage: "Secondary accent" },
      { name: "Dark Green", hex: "#064E3B", usage: "Text and borders" },
      { name: "Casino Red", hex: "#DC2626", usage: "Special highlights" },
    ],
    preview: {
      primary: "#065F46",
      secondary: "#047857",
      accent: "#D4AF37",
      background: "#065F46",
      text: "#F4E4BC",
    },
  },
  {
    name: "Forest Felt",
    description: "Natural forest green with warm browns and golden accents",
    category: "Green Felt Theme",
    colors: [
      { name: "Forest Green", hex: "#166534", usage: "Primary background" },
      { name: "Sage Green", hex: "#16A34A", usage: "Secondary background" },
      { name: "Warm Gold", hex: "#EAB308", usage: "Primary accent" },
      { name: "Cream", hex: "#FEF3C7", usage: "Secondary accent" },
      { name: "Dark Forest", hex: "#14532D", usage: "Text and borders" },
      { name: "Copper", hex: "#B87333", usage: "Special highlights" },
    ],
    preview: {
      primary: "#166534",
      secondary: "#16A34A",
      accent: "#EAB308",
      background: "#166534",
      text: "#FEF3C7",
    },
  },
  {
    name: "Burgundy & Gold",
    description:
      "Luxurious burgundy theme that complements green felt beautifully",
    category: "Complementary Theme",
    colors: [
      { name: "Deep Burgundy", hex: "#7F1D1D", usage: "Primary background" },
      { name: "Burgundy", hex: "#991B1B", usage: "Secondary background" },
      { name: "Gold", hex: "#D4AF37", usage: "Primary accent" },
      { name: "Light Gold", hex: "#F4E4BC", usage: "Secondary accent" },
      { name: "Dark Burgundy", hex: "#450A0A", usage: "Text and borders" },
      { name: "Cream", hex: "#FEF3C7", usage: "Special highlights" },
    ],
    preview: {
      primary: "#7F1D1D",
      secondary: "#991B1B",
      accent: "#D4AF37",
      background: "#7F1D1D",
      text: "#F4E4BC",
    },
  },
  {
    name: "Navy & Gold",
    description:
      "Sophisticated navy theme that creates elegant contrast with green felt",
    category: "Complementary Theme",
    colors: [
      { name: "Deep Navy", hex: "#1E3A8A", usage: "Primary background" },
      { name: "Navy Blue", hex: "#2563EB", usage: "Secondary background" },
      { name: "Gold", hex: "#D4AF37", usage: "Primary accent" },
      { name: "Light Gold", hex: "#F4E4BC", usage: "Secondary accent" },
      { name: "Dark Navy", hex: "#1E1B4B", usage: "Text and borders" },
      { name: "Cream", hex: "#FEF3C7", usage: "Special highlights" },
    ],
    preview: {
      primary: "#1E3A8A",
      secondary: "#2563EB",
      accent: "#D4AF37",
      background: "#1E3A8A",
      text: "#F4E4BC",
    },
  },
];

const Palettes: React.FC = () => {
  const navigate = useNavigate();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const ColorSwatch: React.FC<{
    color: string;
    name: string;
    usage: string;
  }> = ({ color, name, usage }) => (
    <div className="group relative">
      <div
        className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer transition-transform duration-200 hover:scale-105"
        style={{ backgroundColor: color }}
        onClick={() => copyToClipboard(color)}
      />
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {copiedColor === color ? "Copied!" : "Click to copy"}
      </div>
      <div className="mt-2 text-center">
        <div className="font-semibold text-sm text-gray-900">{name}</div>
        <div className="text-xs text-gray-600">{color}</div>
        <div className="text-xs text-gray-500 mt-1">{usage}</div>
      </div>
    </div>
  );

  const PalettePreview: React.FC<{ palette: ColorPalette }> = ({ palette }) => (
    <div
      className="p-6 rounded-xl border border-gray-200"
      style={{ backgroundColor: palette.preview.background }}
    >
      <div className="text-center mb-4">
        <h4
          className="font-bold text-lg mb-2"
          style={{ color: palette.preview.text }}
        >
          {palette.name}
        </h4>
        <p
          className="text-sm opacity-80"
          style={{ color: palette.preview.text }}
        >
          {palette.description}
        </p>
      </div>

      <div className="space-y-3">
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ backgroundColor: palette.preview.secondary }}
        >
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: palette.preview.accent }}
          ></div>
          <div className="flex-1">
            <div
              className="font-semibold text-sm"
              style={{ color: palette.preview.text }}
            >
              Primary Button
            </div>
            <div
              className="text-xs opacity-80"
              style={{ color: palette.preview.text }}
            >
              Main action button
            </div>
          </div>
        </div>

        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: palette.preview.primary,
            borderColor: palette.preview.accent,
          }}
        >
          <div className="text-sm" style={{ color: palette.preview.text }}>
            This is how text would look on the primary background with accent
            borders.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Palette className="h-8 w-8 text-gold" />
            <h1 className="text-3xl font-bold text-gray-900">Color Palettes</h1>
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-8 max-w-3xl">
          Explore different color palette options for your card game. Each
          palette is designed to work well with the casino theme while providing
          unique visual experiences. Click on any color to copy its hex value.
        </p>

        {/* Palette Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PALETTES.map((palette, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {palette.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {palette.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Preview</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {palette.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Color Swatches */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Color Palette
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {palette.colors.map((color, colorIndex) => (
                      <ColorSwatch
                        key={colorIndex}
                        color={color.hex}
                        name={color.name}
                        usage={color.usage}
                      />
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Live Preview
                  </h4>
                  <PalettePreview palette={palette} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage Tips */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              How to Use These Palettes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  🎨 Implementation
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Copy hex values to your CSS variables</li>
                  <li>• Test contrast ratios for accessibility</li>
                  <li>• Consider dark/light mode variations</li>
                  <li>• Maintain consistency across components</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use primary colors for main actions</li>
                  <li>• Secondary colors for backgrounds</li>
                  <li>• Accent colors for highlights</li>
                  <li>• Ensure text remains readable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Palettes;
