import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("=== FUNÇÃO INICIADA ===");
  console.log("Método:", req.method);
  console.log("URL:", req.url);

  if (req.method === "OPTIONS") {
    console.log("Retornando CORS para OPTIONS");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Tentando ler JSON...");
    const body = await req.json();
    console.log("Dados recebidos:", body);

    const { email, fullName, age, day, teacherEmail } = body;

    if (!email || !fullName || !age || !day || !teacherEmail) {
      console.log("Dados faltando!");
      return new Response(
        JSON.stringify({ error: "Dados incompletos", receivedData: body }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const days = ['', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayName = days[parseInt(day)] || `Dia ${day}`;

    console.log("=== TENTANDO ENVIAR EMAIL ===");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY não encontrada!");
      return new Response(
        JSON.stringify({ error: "API key não configurada" }),
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
      from: "Escola Teológica <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: `Presença: ${fullName} - ${dayName}`,
      html: `
        <h1>Nova Presença Registrada</h1>
        <p><strong>Nome:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Idade:</strong> ${age} anos</p>
        <p><strong>Dia:</strong> ${dayName}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      `,
    });

    console.log("Email enviado!", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Presença registrada e email enviado!",
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