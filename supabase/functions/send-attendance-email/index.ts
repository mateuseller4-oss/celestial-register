import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Simular envio de email (sem Resend por enquanto para testar)
    console.log(`Email seria enviado para: ${teacherEmail}`);
    console.log(`Aluno: ${fullName}, Email: ${email}, Idade: ${age}, Dia: ${dayName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Presença registrada com sucesso!",
        data: { fullName, email, age, dayName, teacherEmail }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});