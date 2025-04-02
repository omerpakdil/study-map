import AnalysisForm from "@/components/forms/analysis-form";

export const metadata = {
  title: "StudyMap | Analiz Formu",
  description: "Kişiselleştirilmiş çalışma programı oluşturmak için analiz formunu doldurun.",
};

export default function AnalysisPage() {
  return (
    <div className="w-full flex justify-center py-10">
      <div className="container max-w-5xl px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-primary mb-6">
            Sınav Analiz Formu
          </h1>
          <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
            Kişiselleştirilmiş çalışma programınızı oluşturmak için aşağıdaki formu doldurun.
            Verileriniz yapay zeka tarafından analiz edilecek ve size özel çalışma programı oluşturulacaktır.
          </p>
        </div>

        <AnalysisForm />
      </div>
    </div>
  );
} 