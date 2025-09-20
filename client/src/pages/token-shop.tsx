import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TokenShop() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get user's purchased items
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ['/api/shop/purchases'],
  });

  // Get shop catalog from server
  const { data: catalog = {} } = useQuery<any>({
    queryKey: ['/api/shop/catalog'],
  });

  // UI display items with visual styling
  const shopItems = [
    {
      id: 1,
      gradient: "from-purple-500 to-pink-500",
      icon: "👑",
      detail: "Get more detailed solutions with additional practice problems.",
    },
    {
      id: 2,
      gradient: "from-blue-500 to-cyan-500",
      icon: "🚀",
      detail: "Customize your profile with a cool astronaut theme.",
    },
    {
      id: 3,
      gradient: "from-green-500 to-emerald-500",
      icon: "🎨",
      detail: "Reduce eye strain with our beautiful dark mode interface.",
    },
    {
      id: 4,
      gradient: "from-orange-500 to-red-500",
      icon: "🧘",
      detail: "Unlock new exercise missions including yoga and stretching routines.",
    },
  ];

  // Purchase mutation - SECURE VERSION (only sends itemId)
  const purchaseMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest('POST', '/api/shop/purchase', {
        itemId: item.id.toString(), // Only send itemId - server validates everything else
      });
      return response.json();
    },
    onSuccess: (data, item) => {
      // Update user token count and purchased items
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/purchases'] });
      
      const catalogItem = catalog[item.id.toString()];
      toast({
        title: "Purchase Successful! 🎉",
        description: `You bought "${catalogItem?.title}" for ${catalogItem?.tokenCost} tokens!`,
      });
    },
    onError: (error: any) => {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to complete purchase. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handlePurchase = (item: any) => {
    purchaseMutation.mutate(item);
  };

  // Check if an item is already purchased
  const isItemPurchased = (itemId: number) => {
    return purchases.some((purchase: any) => purchase.itemId === itemId.toString());
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/profile')}
          className="w-10 h-10 p-0 rounded-full"
          data-testid="back-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Token Shop</h1>
        <div className="token-gradient px-3 py-1 rounded-full">
          <span className="text-white text-sm font-semibold" data-testid="header-token-count">{user?.tokens || 0}</span>
        </div>
      </div>
      
      {/* Shop Items */}
      <div className="p-4 space-y-4">
        {shopItems.map((item) => {
          const catalogItem = catalog[item.id.toString()];
          if (!catalogItem) return null; // Don't render if not in catalog

          return (
            <Card key={item.id} className="p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-2xl`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" data-testid={`item-title-${item.id}`}>{catalogItem.title}</h3>
                    <p className="text-muted-foreground text-sm" data-testid={`item-description-${item.id}`}>{catalogItem.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="token-gradient px-3 py-1 rounded-full">
                    <span className="text-white font-semibold" data-testid={`item-cost-${item.id}`}>{catalogItem.tokenCost}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">tokens</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4" data-testid={`item-detail-${item.id}`}>
                {item.detail}
              </p>
              
              <Button 
                onClick={() => handlePurchase(item)}
                className="w-full py-3 font-semibold"
                disabled={
                  (user?.tokens || 0) < catalogItem.tokenCost || 
                  isItemPurchased(item.id) || 
                  purchaseMutation.isPending
                }
                data-testid={`purchase-button-${item.id}`}
              >
                {purchaseMutation.isPending ? (
                  "Purchasing..."
                ) : isItemPurchased(item.id) ? (
                  "✅ Owned"
                ) : (user?.tokens || 0) < catalogItem.tokenCost ? (
                  "Insufficient Tokens"
                ) : (
                  "Purchase"
                )}
              </Button>
            </Card>
          );
        })}

        {/* Coming Soon Section */}
        <Card className="p-6 border border-dashed border-muted">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-2">More Items Coming Soon!</h3>
            <p className="text-muted-foreground text-sm">
              New themes, exercises, and features will be available soon. Keep earning tokens!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
