const { Resend } = require('resend');

let resendClient = null;

if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

exports.sendVerificationEmail = async (toEmail, code) => {
  const fromEmail = process.env.RESEND_FROM || 'CheatF/T <onboarding@resend.dev>';
  const subject = '[CheatF/T] 비밀번호 재설정 인증번호 안내';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4F46E5;">CheatF/T 비밀번호 재설정</h2>
      <p>안녕하세요. 비밀번호 재설정을 위한 인증번호입니다.</p>
      <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #111827;">${code}</span>
      </div>
      <p style="color: #6B7280; font-size: 14px;">인증번호는 <strong>5분간 유효</strong>하며, 본인이 요청하지 않은 경우 이 메일을 무시하시기 바랍니다.</p>
    </div>
  `;

  if (resendClient) {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html: htmlContent
    });

    if (error) {
      console.error('Resend 이메일 발송 에러:', error);
      throw new Error(`이메일 발송에 실패했습니다: ${error.message}`);
    }

    return data;
  } else {
    // RESEND_API_KEY 미설정 시 개발/테스트용 콘솔 로그 전송 모의 처리
    console.log(`📧 [Resend Mock Mode] To: ${toEmail} | Verification Code: ${code}`);
    return { id: 'mock_resend_id' };
  }
};
