import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ยอมรับ cookie แล้วหรือยัง
    const consent = localStorage.getItem("cookie-consent");
    console.log("[CookieConsent] Current consent:", consent);
    if (!consent) {
      console.log("[CookieConsent] Showing banner");
      setShow(true);
    } else {
      console.log("[CookieConsent] Already consented, hiding banner");
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm">🍪 การใช้คุกกี้</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-1"
                onClick={declineCookies}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              เว็บไซต์นี้ใช้คุกกี้เพื่อจัดเก็บข้อมูลการเข้าสู่ระบบและปรับปรุงประสบการณ์การใช้งานของคุณ
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={acceptCookies} className="flex-1">
                ยอมรับ
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={declineCookies}
                className="flex-1"
              >
                ปฏิเสธ
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
