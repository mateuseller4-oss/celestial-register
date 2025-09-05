import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("Função iniciada, método:", req.method);

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, age, day, teacherEmail } = await req.json();
    console.log("Dados recebidos:", { email, fullName, age, day, teacherEmail });

    const days = ['', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayName = days[parseInt(day)] || `Dia ${day}`;

    // Verificar se a chave API existe
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY não encontrada");
      return new Response(
        JSON.stringify({ error: "Configuração de email não encontrada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Inicializar Resend
    const resend = new Resend(resendApiKey);
    console.log("Enviando email para:", teacherEmail);

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "Escola Teológica <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: `Nova Presença Registrada - ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">📚 Escola Teológica</h1>
            <h2 style="color: #1e40af; margin: 0;">Chamada Online</h2>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 20px;">✅ Nova Presença Registrada</h3>
            
            <table style="width: 100%; border-spacing: 0;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #374151; width: 40%;">👤 Nome Completo:</td>
                <td style="padding: 10px 0; color: #6b7280;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">📧 E-mail:</td>
                <td style="padding: 10px 0; color: #6b7280;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">🎂 Idade:</td>
                <td style="padding: 10px 0; color: #6b7280;">${age} anos</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">📅 Dia da Aula:</td>
                <td style="padding: 10px 0; color: #6b7280;">${dayName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #374151;">🕐 Data/Hora:</td>
                <td style="padding: 10px 0; color: #6b7280;">${new Date().toLocaleString('pt-BR')}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Este é um e-mail automático do sistema de chamada online da Escola Teológica.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Presença registrada e e-mail enviado com sucesso!",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});