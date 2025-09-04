import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Calendar } from "lucide-react";

export default function AttendanceForm() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    age: "",
    day: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement email sending functionality with Supabase
    console.log("Attendance data:", formData);
    
    toast({
      title: "Chamada registrada!",
      description: "Sua presença foi registrada com sucesso.",
    });

    // Reset form
    setFormData({ email: "", fullName: "", age: "", day: "" });
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getDaysOfWeek = () => {
    const days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
    return days;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-divine to-divine-light shadow-[var(--shadow-divine)]">
              <BookOpen className="h-8 w-8 text-sacred" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-divine to-divine-light bg-clip-text text-transparent mb-2">
            Escola Teológica
          </h1>
          <p className="text-muted-foreground">
            Registre sua presença na aula de hoje
          </p>
        </div>

        <Card className="shadow-[var(--shadow-sacred)] border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-3">
              <Users className="h-6 w-6 text-divine" />
            </div>
            <CardTitle className="text-xl text-divine">Chamada Online</CardTitle>
            <CardDescription className="text-sm">
              Preencha seus dados para confirmar sua presença
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-11 bg-card border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Nome Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="h-11 bg-card border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-foreground">
                  Idade
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Sua idade"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  required
                  min="16"
                  max="100"
                  className="h-11 bg-card border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="day" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-divine" />
                  Dia da Aula
                </Label>
                <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)} required>
                  <SelectTrigger className="h-11 bg-card border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]">
                    <SelectValue placeholder="Selecione o dia da aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDaysOfWeek().map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-divine to-divine-light hover:from-divine-light hover:to-divine text-sacred font-semibold shadow-[var(--shadow-divine)] transition-[var(--transition-divine)] hover:shadow-lg hover:scale-[1.02]"
              >
                {isSubmitting ? "Registrando..." : "Confirmar Presença"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Sistema de Chamada Online - Escola Teológica
          </p>
        </div>
      </div>
    </div>
  );
}