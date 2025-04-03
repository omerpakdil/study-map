"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CreditCard, Building, AlertCircle } from "lucide-react";

// Form şeması
const checkoutFormSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  fullName: z.string().min(3, { message: "İsim en az 3 karakter olmalıdır" }),
  cardNumber: z.string().regex(/^[0-9]{16}$/, { message: "Geçerli bir kart numarası giriniz" }),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "AA/YY formatında giriniz" }),
  cvc: z.string().regex(/^[0-9]{3,4}$/, { message: "Geçerli bir CVC giriniz" }),
  address: z.string().min(5, { message: "Adres en az 5 karakter olmalıdır" }),
  city: z.string().min(2, { message: "Geçerli bir şehir giriniz" }),
  postalCode: z.string().min(5, { message: "Geçerli bir posta kodu giriniz" }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Koşulları kabul etmelisiniz",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutFormProps {
  programId: string;
  price: number;
  currency: string;
  discountedPrice?: number;
  onSubmit: (data: CheckoutFormValues) => Promise<void>;
}

export function CheckoutForm({
  programId,
  price,
  currency,
  discountedPrice,
  onSubmit,
}: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("creditCard");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
      address: "",
      city: "",
      postalCode: "",
      termsAccepted: false,
    },
  });

  // Checkbox durumunu izle
  const termsAccepted = watch("termsAccepted");

  const handleCheckboxChange = (checked: boolean) => {
    setValue("termsAccepted", checked, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data);
    } catch (err) {
      console.error("Ödeme hatası:", err);
      setError("Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ödeme Bilgileri</CardTitle>
        <CardDescription>
          Kişiselleştirilmiş programınızı satın almak için lütfen aşağıdaki bilgileri doldurunuz.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={hookFormSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@example.com"
                {...register("email")}
                className={`mt-1 ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                placeholder="Ad Soyad"
                {...register("fullName")}
                className={`mt-1 ${errors.fullName ? "border-destructive" : ""}`}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Tabs defaultValue="creditCard" value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="creditCard" className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Kredi Kartı</span>
                </TabsTrigger>
                <TabsTrigger value="transfer" className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Havale/EFT</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="creditCard" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="cardNumber">Kart Numarası</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    {...register("cardNumber")}
                    className={`mt-1 ${errors.cardNumber ? "border-destructive" : ""}`}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Son Kullanma Tarihi</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      {...register("expiry")}
                      className={`mt-1 ${errors.expiry ? "border-destructive" : ""}`}
                    />
                    {errors.expiry && (
                      <p className="text-sm text-destructive mt-1">{errors.expiry.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="cvc">CVC/CVV</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      {...register("cvc")}
                      className={`mt-1 ${errors.cvc ? "border-destructive" : ""}`}
                    />
                    {errors.cvc && (
                      <p className="text-sm text-destructive mt-1">{errors.cvc.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transfer" className="pt-4 space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <h3 className="font-medium mb-2">Banka Bilgileri</h3>
                  <p className="text-sm mb-4">
                    Aşağıdaki banka hesabına havale/EFT yapabilirsiniz. 
                    İşlem açıklamasına e-posta adresinizi ve program ID'sini ({programId}) eklemeyi unutmayınız.
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-medium">Banka:</span> Example Bank</li>
                    <li><span className="font-medium">Şube:</span> Merkez Şube</li>
                    <li><span className="font-medium">Hesap Sahibi:</span> StudyMap Eğitim Ltd. Şti.</li>
                    <li><span className="font-medium">IBAN:</span> TR00 0000 0000 0000 0000 0000 00</li>
                    <li><span className="font-medium">Açıklama:</span> {`{E-posta} - ${programId}`}</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Önemli Not</p>
                      <p className="text-sm">
                        Havale/EFT işleminden sonra, ödemeniz manuel olarak kontrol edilecek ve onaylandıktan sonra 
                        programınız e-posta adresinize gönderilecektir. Bu işlem mesai saatleri içinde 1-2 saat, 
                        mesai saatleri dışında 24 saate kadar sürebilir.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Fatura Bilgileri</h3>
            
            <div>
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                placeholder="Adres"
                {...register("address")}
                className={`mt-1 ${errors.address ? "border-destructive" : ""}`}
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Şehir</Label>
                <Input
                  id="city"
                  placeholder="Şehir"
                  {...register("city")}
                  className={`mt-1 ${errors.city ? "border-destructive" : ""}`}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="postalCode">Posta Kodu</Label>
                <Input
                  id="postalCode"
                  placeholder="34000"
                  {...register("postalCode")}
                  className={`mt-1 ${errors.postalCode ? "border-destructive" : ""}`}
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms"
                checked={termsAccepted}
                onCheckedChange={handleCheckboxChange}
                className={errors.termsAccepted ? "border-destructive" : ""}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Şartları ve Koşulları Kabul Ediyorum
                </label>
                <p className="text-sm text-muted-foreground">
                  Kişisel verilerimin işlenmesine ve{" "}
                  <a href="/terms" className="text-primary hover:underline">şartlar ve koşulları</a>{" "}
                  okuduğumu ve kabul ettiğimi onaylıyorum.
                </p>
                {errors.termsAccepted && (
                  <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center pb-2">
              <span className="font-medium">Toplam Tutar:</span>
              <span className="font-bold text-lg">
                {discountedPrice ? (
                  <>
                    <span className="line-through text-muted-foreground text-sm mr-2">
                      {price} {currency}
                    </span>
                    {discountedPrice} {currency}
                  </>
                ) : (
                  <>
                    {price} {currency}
                  </>
                )}
              </span>
            </div>
            
            <Button type="submit" disabled={isSubmitting || (paymentMethod === "transfer" && !termsAccepted)}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> İşleniyor...
                </>
              ) : (
                <>
                  {paymentMethod === "creditCard" ? "Ödeme Yap" : "Formu Gönder"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="w-4 h-4" />
          <p>Tüm ödemeler 256-bit SSL şifrelemesi ile güvenlidir.</p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default CheckoutForm; 