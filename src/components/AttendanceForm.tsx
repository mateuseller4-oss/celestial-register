import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Users, Calendar, CheckCircle, XCircle, Mail, User } from "lucide-react";

interface Student {
  nome: string;
  email: string;
  idade: number;
  diaAula: string;
  materia: string;
  status: 'presente' | 'ausente';
  timestamp: Date;
}

const MATERIAS = [
  { value: "teologia-sistematica", label: "Teologia Sistemática" },
  { value: "hermeneutica", label: "Hermenêutica Bíblica" },
  { value: "historia-igreja", label: "História da Igreja" },
  { value: "homiletica", label: "Homilética" },
  { value: "teologia-pastoral", label: "Teologia Pastoral" },
  { value: "apologetica", label: "Apologética" },
  { value: "missoes", label: "Missões" },
  { value: "etica-crista", label: "Ética Cristã" }
];

const DIAS_SEMANA = [
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
  { value: "7", label: "Domingo" }
];

export default function AttendanceForm() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    age: "",
    day: "",
    materia: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Set current date
    const updateDate = () => {
      const hoje = new Date();
      const opcoes: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(hoje.toLocaleDateString('pt-BR', opcoes));
    };
    
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.fullName || !formData.age || !formData.day || !formData.materia) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Por favor, preencha todos os campos!",
        variant: "destructive"
      });
      return;
    }

    // Check if email already exists
    const existingStudent = students.find(s => s.email === formData.email);
    if (existingStudent) {
      toast({
        title: "📝 Email já registrado",
        description: "Este e-mail já foi registrado hoje!",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("=== ENVIANDO DADOS PARA EDGE FUNCTION ===");
      console.log("Dados do formulário:", formData);
      
      // Send data via Edge Function
      const { data, error } = await supabase.functions.invoke('send-attendance-email', {
        body: {
          email: formData.email,
          fullName: formData.fullName,
          age: formData.age,
          day: formData.day,
          materia: formData.materia
        }
      });

      console.log("Resposta da edge function:", { data, error });

      if (error) {
        console.error("Erro retornado pela edge function:", error);
        throw error;
      }
      
      if (data?.success) {
        console.log("✅ Email enviado com sucesso!");
        console.log("ID do email:", data.emailId);
      } else {
        console.warn("⚠️ Resposta sem success flag:", data);
      }
      
      // Add to local students list
      const newStudent: Student = {
        nome: formData.fullName,
        email: formData.email,
        idade: parseInt(formData.age),
        diaAula: formData.day,
        materia: formData.materia,
        status: 'presente',
        timestamp: new Date()
      };
      
      setStudents(prev => [...prev, newStudent]);
      
      toast({
        title: "✅ Presença registrada com sucesso!",
        description: "Sua presença foi registrada e um e-mail foi enviado para o professor.",
      });
      
      // Reset form
      setFormData({
        email: '',
        fullName: '',
        age: '',
        day: '',
        materia: ''
      });
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      toast({
        title: "Erro ao registrar presença",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMateriaLabel = (value: string) => {
    return MATERIAS.find(m => m.value === value)?.label || value;
  };

  const getDiaLabel = (value: string) => {
    return DIAS_SEMANA.find(d => d.value === value)?.label || `Dia ${value}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-main)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-card shadow-[var(--shadow-divine)]">
                <BookOpen className="h-10 w-10 text-divine" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-sacred mb-2">
              📖 Escola Teológica Elpis
            </h1>
            <p className="text-sacred/90 text-lg mb-2">
              Chamada Online - Registro de Presença
            </p>
            <p className="text-sacred/80">
              📅 {currentDate}
            </p>
          </div>

          {/* Form Card */}
          <Card className="mb-8 shadow-[var(--shadow-card)] border-0 animate-fade-in" style={{ background: 'var(--gradient-card)' }}>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-3">
                <Users className="h-6 w-6 text-divine" />
              </div>
              <CardTitle className="text-2xl text-divine">Chamada Online</CardTitle>
              <CardDescription className="text-base">
                Preencha seus dados para confirmar sua presença
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-divine" />
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                    className="h-12 bg-card/50 border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-divine" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-12 bg-card/50 border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]"
                  />
                </div>

                {/* Idade */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium">
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
                    className="h-12 bg-card/50 border-border/60 focus:border-divine focus:ring-divine/20 transition-[var(--transition-divine)]"
                  />
                </div>

                {/* Dia da Aula */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-divine" />
                    Dia da Aula
                  </Label>
                  <Select value={formData.day} onValueChange={(value) => handleInputChange('day', value)}>
                    <SelectTrigger className="h-12 bg-card/50 border-border/60 focus:border-divine focus:ring-divine/20">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map(dia => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Matéria/Curso */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">
                    📚 Matéria/Curso
                  </Label>
                  <Select value={formData.materia} onValueChange={(value) => handleInputChange('materia', value)}>
                    <SelectTrigger className="h-12 bg-card/50 border-border/60 focus:border-divine focus:ring-divine/20">
                      <SelectValue placeholder="Selecione a matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAS.map(materia => (
                        <SelectItem key={materia.value} value={materia.value}>
                          {materia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 text-center mt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-8 text-lg font-semibold transition-[var(--transition-bounce)] hover:scale-[1.02]"
                    style={{ 
                      background: 'var(--gradient-main)',
                      color: 'hsl(var(--sacred-white))',
                      boxShadow: 'var(--shadow-elevated)'
                    }}
                  >
                    {isSubmitting ? "Registrando..." : "✓ Registrar Presença"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="shadow-[var(--shadow-card)] border-0 animate-fade-in" style={{ background: 'var(--gradient-card)' }}>
            <CardHeader>
              <CardTitle className="text-2xl text-divine text-center">
                📋 Lista de Presença - Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum estudante registrado hoje.
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-6 rounded-2xl transition-[var(--transition-smooth)] hover:translate-x-2 animate-slide-in"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))',
                        borderLeft: '5px solid hsl(var(--divine-blue))'
                      }}
                    >
                      <div className="flex-grow">
                        <div className="font-bold text-lg text-foreground mb-1">
                          {student.nome}
                        </div>
                        <div className="text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span>📧 {student.email}</span>
                            <span>🎂 {student.idade} anos</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>📚 {getMateriaLabel(student.materia)}</span>
                            <span>📅 {getDiaLabel(student.diaAula)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${
                        student.status === 'presente' 
                          ? 'bg-success-green text-white' 
                          : 'bg-error-red text-white'
                      }`}>
                        {student.status === 'presente' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {student.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sacred/70 text-sm">
              Sistema de Chamada Online - Escola Teológica Elpis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}