import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("=== FUNÇÃO INICIADA ===");
  console.log("Método:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Retornando CORS para OPTIONS");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Tentando ler JSON...");
    const body = await req.json();
    console.log("Dados recebidos:", JSON.stringify(body, null, 2));

    const { email, fullName, age, day, materia } = body;

    if (!email || !fullName || !age || !day || !materia) {
      console.log("ERRO: Dados faltando!");
      return new Response(
        JSON.stringify({ error: "Dados incompletos", receivedData: body }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log("✅ Todos os dados estão presentes!");

    const days = ['', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayName = days[parseInt(day)] || `Dia ${day}`;

    const materias = {
      'teologia-sistematica': 'Teologia Sistemática',
      'hermeneutica': 'Hermenêutica Bíblica',
      'historia-igreja': 'História da Igreja',
      'homiletica': 'Homilética',
      'teologia-pastoral': 'Teologia Pastoral',
      'apologetica': 'Apologética',
      'missoes': 'Missões',
      'etica-crista': 'Ética Cristã'
    };

    const materiaName = materias[materia] || materia;

    console.log("=== ENVIANDO EMAIL VIA RESEND ===");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY não encontrada!");
      return new Response(
        JSON.stringify({ error: "API key do Resend não configurada" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log("API key encontrada, importando Resend...");
    const { Resend } = await import("npm:resend@2.0.0");
    const resend = new Resend(resendApiKey);

    console.log("Enviando email...");
    const emailResult = await resend.emails.send({
      from: "Escola Teológica Elpis <onboarding@resend.dev>",
      to: ["elpisescolateologica@gmail.com"],
      subject: `Nova Presença: ${fullName} - ${dayName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px;">📖 Nova Presença Registrada</h1>
            
            <div style="background: #f0f8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>👤 Nome:</strong> ${fullName}</p>
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>🎂 Idade:</strong> ${age} anos</p>
              <p style="margin: 8px 0;"><strong>📅 Dia da Aula:</strong> ${dayName}</p>
              <p style="margin: 8px 0;"><strong>📚 Matéria:</strong> ${materiaName}</p>
              <p style="margin: 8px 0;"><strong>🕐 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; text-align: center;">
              <p>Sistema de Chamada Online - Escola Teológica Elpis</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("📧 Resultado do Resend:", JSON.stringify(emailResult, null, 2));
    
    if (emailResult.error) {
      console.error("❌ ERRO DO RESEND:", emailResult.error);
      throw new Error(`Erro do Resend: ${JSON.stringify(emailResult.error)}`);
    }
    
    if (emailResult.data) {
      console.log("✅ Email enviado com ID:", emailResult.data.id);
      console.log("📤 Destinatário:", "elpisescolateologica@gmail.com");
    } else {
      console.log("⚠️ Resposta sem data:", emailResult);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Presença registrada e email enviado para elpisescolateologica@gmail.com!",
        emailService: "Resend",
        emailId: emailResult.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("=== ERRO NA FUNÇÃO ===");
    console.error("Erro:", error);
    console.error("Stack:", error.stack);

    return new Response(
      JSON.stringify({ 
        error: "Erro interno",
        message: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
});