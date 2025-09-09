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
    
    console.log("Campos extraídos:");
    console.log("- email:", email);
    console.log("- fullName:", fullName);
    console.log("- age:", age);
    console.log("- day:", day);
    console.log("- materia:", materia);

    if (!email || !fullName || !age || !day || !materia) {
      console.log("ERRO: Dados faltando!");
      console.log("Verificação individual:");
      console.log("- email presente:", !!email);
      console.log("- fullName presente:", !!fullName);
      console.log("- age presente:", !!age);
      console.log("- day presente:", !!day);
      console.log("- materia presente:", !!materia);
      
      return new Response(
        JSON.stringify({ 
          error: "Dados incompletos", 
          receivedData: body,
          validation: {
            email: !!email,
            fullName: !!fullName,
            age: !!age,
            day: !!day,
            materia: !!materia
          }
        }),
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

    console.log("=== PREPARANDO ENVIO DE EMAIL VIA EMAILJS ===");

    // Obter as credenciais do EmailJS
    const serviceId = Deno.env.get("EMAILJS_SERVICE_ID");
    const templateId = Deno.env.get("EMAILJS_TEMPLATE_ID");
    const publicKey = Deno.env.get("EMAILJS_PUBLIC_KEY");

    if (!serviceId || !templateId || !publicKey) {
      console.log("Credenciais do EmailJS não configuradas!");
      return new Response(
        JSON.stringify({ 
          error: "Credenciais do EmailJS não configuradas",
          missing: {
            serviceId: !serviceId,
            templateId: !templateId,
            publicKey: !publicKey
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log("Credenciais do EmailJS encontradas, enviando email...");

    // Preparar os parâmetros para o template do EmailJS
    const templateParams = {
      to_email: "elpisescolateologica@gmail.com",
      from_name: fullName,
      student_name: fullName,
      student_email: email,
      student_age: age,
      class_day: dayName,
      subject_name: materiaName,
      attendance_date: new Date().toLocaleString('pt-BR'),
      message: `Nova presença registrada:
      
Nome: ${fullName}
Email: ${email}
Idade: ${age} anos
Dia da Aula: ${dayName}
Matéria: ${materiaName}
Data/Hora: ${new Date().toLocaleString('pt-BR')}`
    };

    // Enviar email via EmailJS API
    const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      })
    });

    console.log("Status da resposta do EmailJS:", emailjsResponse.status);
    const emailjsResponseText = await emailjsResponse.text();
    console.log("Resposta do EmailJS:", emailjsResponseText);

    if (!emailjsResponse.ok) {
      throw new Error(`EmailJS erro: ${emailjsResponse.status} - ${emailjsResponseText}`);
    }

    console.log("Email enviado com sucesso via EmailJS!");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Presença registrada e email enviado para elpisescolateologica@gmail.com!",
        emailService: "EmailJS",
        sentTo: "elpisescolateologica@gmail.com"
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