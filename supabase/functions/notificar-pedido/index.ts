// file_path: supabase/functions/notificar-pedido/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { record: pedido } = payload;

    // Crear un cliente de Supabase para obtener datos del usuario
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obtener el correo del usuario
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuario')
      .select('correo, nombre')
      .eq('id_usuario', pedido.id_usuario)
      .single();

    if (userError) throw userError;

    // Enviar el email usando Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Pokemon TCG Shop <onboarding@resend.dev>', // Puedes configurar un dominio personalizado en Resend
        to: [userData.correo],
        subject: `Confirmación de tu pedido #${pedido.id_pedido}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>¡Gracias por tu compra, ${userData.nombre}!</h2>
            <p>Hemos recibido tu pedido <strong>#${pedido.id_pedido}</strong> por un total de <strong>$${pedido.precio_total} MXN</strong>.</p>
            <p>Pronto te notificaremos cuando sea enviado. ¡Gracias por confiar en Pokémon TCG Shop!</p>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    return new Response(JSON.stringify(emailData), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});