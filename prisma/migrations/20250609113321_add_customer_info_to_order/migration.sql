-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Hazırlanıyor',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "items" JSONB NOT NULL,
    "customerName" TEXT,
    "address" TEXT,
    "phone" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
