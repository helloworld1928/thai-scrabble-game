import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";

export const notificationRouter = router({
  // ส่งการแจ้งเตือนถึงเจ้าของโปรเจกต์
  notifyOwner: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await notifyOwner({
        title: input.title,
        content: input.content,
      });
      
      return { success };
    }),
  
  // ส่งการแจ้งเตือนเมื่อผู้เล่นทำคะแนนสูง
  notifyHighScore: protectedProcedure
    .input(
      z.object({
        score: z.number(),
        gameId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // ส่งการแจ้งเตือนถ้าคะแนนสูงกว่า 200
      if (input.score >= 200) {
        const success = await notifyOwner({
          title: `🎉 คะแนนสูง! ${input.score} คะแนน`,
          content: `ผู้เล่น ${ctx.user.name || 'ไม่ระบุชื่อ'} ทำคะแนนได้ ${input.score} คะแนนในเกม #${input.gameId}`,
        });
        
        return { success, notified: true };
      }
      
      return { success: true, notified: false };
    }),
  
  // ส่งการแจ้งเตือนเมื่อมีการซื้อสินค้า
  notifyPurchase: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await notifyOwner({
        title: `💰 มีการซื้อสินค้าใหม่!`,
        content: `${ctx.user.name || 'ผู้ใช้'} ซื้อ ${input.productName} ราคา ฿${input.amount / 100}`,
      });
      
      return { success };
    }),
});
