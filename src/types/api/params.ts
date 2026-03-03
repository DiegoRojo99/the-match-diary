// Reusable types for Next.js API route parameters

// Generic async params type for Next.js 15+ dynamic routes
export interface AsyncParams<T = Record<string, string>> {
  params: Promise<T>;
}

// Common route parameter types
export interface IdParams {
  id: string;
}

export interface SlugParams {
  slug: string;
}

// Combined type for ID-based routes  
export type IdRouteParams = AsyncParams<IdParams>;

// Combined type for slug-based routes
export type SlugRouteParams = AsyncParams<SlugParams>;

// Example usage:
// export async function GET(request: NextRequest, { params }: IdRouteParams) {
//   const { id } = await params;
//   // ... rest of handler
// }