import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Home, ShoppingCart, Check, Coffee } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

const PRODUCTS = {
  theme_classic: {
    id: 'theme_classic',
    name: 'ธีมคลาสสิก',
    description: 'ธีมกระดานสไตล์คลาสสิก สีเขียวเข้มสบายตา',
    price: 29,
    icon: '🎨',
  },
  theme_gold: {
    id: 'theme_gold',
    name: 'ธีมทอง',
    description: 'ธีมกระดานสีทองหรูหรา เพิ่มความโดดเด่นให้การเล่น',
    price: 39,
    icon: '✨',
  },
  theme_rainbow: {
    id: 'theme_rainbow',
    name: 'ธีมสีรุ้ง',
    description: 'ธีมกระดานสีสันสดใส เพิ่มความสนุกสนาน',
    price: 49,
    icon: '🌈',
  },
  support_matcha: {
    id: 'support_matcha',
    name: 'ซื้อชามัชฉะ',
    description: 'สนับสนุนผู้พัฒนาด้วยชามัชฉะสักแก้ว ขอบคุณที่ใช้งานเกม!',
    price: 50,
    icon: '🍵',
  },
};

export default function Shop() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: purchases, isLoading } = trpc.payment.myPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const createCheckout = trpc.payment.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("กำลังเปิดหน้าชำระเงิน...");
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเข้าร้านค้า");
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const purchasedIds = new Set(purchases?.map(p => p.productId) || []);

  const handlePurchase = (productId: string) => {
    createCheckout.mutate({ productId });
  };

  const themes = [
    PRODUCTS.theme_classic,
    PRODUCTS.theme_gold,
    PRODUCTS.theme_rainbow,
  ];

  const support = [PRODUCTS.support_matcha];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            ร้านค้า
          </h1>
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4 mr-2" />
            หน้าหลัก
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* ธีมกระดาน */}
        <section>
          <h2 className="text-2xl font-bold mb-4">ธีมกระดาน</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {themes.map((product) => {
              const purchased = purchasedIds.has(product.id);
              return (
                <Card key={product.id} className={purchased ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="text-4xl mb-2">{product.icon}</div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      ฿{product.price}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {purchased ? (
                      <Button disabled className="w-full" variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        ซื้อแล้ว
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(product.id)}
                        disabled={createCheckout.isPending}
                      >
                        {createCheckout.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            กำลังประมวลผล...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            ซื้อเลย
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {/* สนับสนุนผู้พัฒนา */}
        <section>
          <h2 className="text-2xl font-bold mb-4">สนับสนุนผู้พัฒนา</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {support.map((product) => (
              <Card key={product.id} className="border-secondary">
                <CardHeader>
                  <div className="text-4xl mb-2">{product.icon}</div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    ฿{product.price}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => handlePurchase(product.id)}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังประมวลผล...
                      </>
                    ) : (
                      <>
                        <Coffee className="h-4 w-4 mr-2" />
                        สนับสนุน
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* ประวัติการซื้อ */}
        {purchases && purchases.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">ประวัติการซื้อ</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <div className="font-medium">{purchase.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(purchase.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">฿{purchase.amount / 100}</div>
                        <div className="text-sm text-green-600">สำเร็จ</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
