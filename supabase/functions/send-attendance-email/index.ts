import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AttendanceRequest {
  email: string;
  fullName: string;
  age: string;
  day: string;
  teacherEmail: string;
}

const getDayName = (dayNumber: string): string => {
  const days = {
    '1': 'Segunda-feira',
    '2': 'Terça-feira',
    '3': 'Quarta-feira',
    '4': 'Quinta-feira',
    '5': 'Sexta-feira',
    '6': 'Sábado',
    '7': 'Domingo'
  };
  return days[dayNumber as keyof typeof days] || `Dia ${dayNumber}`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Função send-attendance-email chamada");
    
    const requestBody = await req.json();
    console.log("Dados recebidos:", requestBody);
    
    const { email, fullName, age, day, teacherEmail }: AttendanceRequest = requestBody;

    if (!email || !fullName || !age || !day || !teacherEmail) {
      console.error("Dados faltando:", { email, fullName, age, day, teacherEmail });
      throw new Error("Todos os campos são obrigatórios");
    }

    console.log("Enviando email para:", teacherEmail);

    const dayName = getDayName(day);

    // Enviar email para o professor
    const emailResponse = await resend.emails.send({
      from: "Escola Teológica <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: `Nova Presença Registrada - ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; text-align: center;">📚 Escola Teológica - Chamada Online</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-bottom: 15px;">Nova Presença Registrada</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nome Completo:</td>
                <td style="padding: 8px 0; color: #6b7280;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">E-mail:</td>
                <td style="padding: 8px 0; color: #6b7280;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Idade:</td>
                <td style="padding: 8px 0; color: #6b7280;">${age} anos</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Dia da Aula:</td>
                <td style="padding: 8px 0; color: #6b7280;">${dayName}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #6b7280; text-align: center; font-size: 14px;">
            Presença registrada em ${new Date().toLocaleString('pt-BR')}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #9ca3af; text-align: center; font-size: 12px;">
            Este é um e-mail automático do sistema de chamada online da Escola Teológica.
          </p>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro na função send-attendance-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);