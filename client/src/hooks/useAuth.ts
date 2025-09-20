import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Generate or retrieve anonymous user ID
function getAnonymousUserId(): string {
  const storageKey = "anonymous_user_id";
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    // Generate new UUID for anonymous user
    userId = crypto.randomUUID();
    localStorage.setItem(storageKey, userId);
  }
  
  return userId;
}

export function useAuth() {
  const userId = getAnonymousUserId();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user", userId],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/auth/user", { userId });
      return response.json();
    },
    retry: false,
  });

  return {
    user,
    userId,
    isLoading,
    isAuthenticated: true, // Always authenticated with anonymous user
  };
}
