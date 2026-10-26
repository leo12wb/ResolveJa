export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
          <p className="text-sm text-gray-500 mt-2">Última atualização: outubro de 2026</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 text-sm text-blue-800">
          <strong>ResolveJá</strong> está comprometida com a proteção dos seus dados pessoais
          nos termos da <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
        </div>

        {[
          {
            titulo: '1. Quem somos (Controlador)',
            conteudo: `A ResolveJá (fixfirst.io) é a controladora dos dados pessoais tratados nesta plataforma.
              Para exercer seus direitos ou falar com nosso Encarregado de Dados (DPO),
              entre em contato pelo e-mail: privacidade@fixfirst.io`,
          },
          {
            titulo: '2. Dados que coletamos',
            conteudo: `Coletamos os seguintes dados pessoais:
              • Cadastro: nome completo, e-mail, senha (armazenada com hash bcrypt fator 12).
              • Operação: dados dos seus clientes (nome, telefone, e-mail, endereço) inseridos por você.
              • Uso: logs de acesso (IP, user-agent, data/hora) para segurança e auditoria — retidos por 6 meses.
              • Financeiro: valores de serviços e despesas (não armazenamos dados bancários ou de cartão).`,
          },
          {
            titulo: '3. Base legal (Art. 7 LGPD)',
            conteudo: `Tratamos seus dados com base em:
              • Consentimento (Art. 7, I): coletado na criação de conta, revogável a qualquer momento.
              • Execução de contrato (Art. 7, V): necessário para prestação do serviço.
              • Legítimo interesse (Art. 7, IX): logs de segurança e prevenção de fraudes.
              • Cumprimento de obrigação legal (Art. 7, II): quando exigido por lei.`,
          },
          {
            titulo: '4. Seus direitos (Art. 18 LGPD)',
            conteudo: `Você tem direito a:
              • Confirmação de tratamento e acesso aos dados (acesse: Conta → Exportar meus dados).
              • Correção de dados incompletos ou desatualizados.
              • Anonimização, bloqueio ou eliminação de dados desnecessários.
              • Portabilidade — solicite via privacidade@fixfirst.io.
              • Revogação do consentimento — acesse: Conta → Encerrar conta.
              Respondemos em até 15 dias úteis conforme orientação da ANPD.`,
          },
          {
            titulo: '5. Compartilhamento',
            conteudo: `Não vendemos dados pessoais. Podemos compartilhá-los apenas com:
              • Provedores de infraestrutura (hospedagem, banco de dados) sob contrato com cláusulas de proteção de dados.
              • Autoridades públicas, quando exigido por lei.`,
          },
          {
            titulo: '6. Retenção e exclusão',
            conteudo: `Seus dados são mantidos enquanto a conta estiver ativa.
              Logs de acesso são excluídos automaticamente após 6 meses.
              Ao encerrar a conta, seus dados pessoais são anonimizados em até 30 dias,
              exceto quando a retenção for exigida por obrigação legal.`,
          },
          {
            titulo: '7. Segurança',
            conteudo: `Adotamos medidas técnicas e organizacionais incluindo:
              criptografia em trânsito (TLS 1.2+), hash de senhas (BCrypt fator 12),
              rate limiting, autenticação JWT com expiração de 24 horas,
              e isolamento de dados por conta (cada prestador acessa apenas seus dados).`,
          },
          {
            titulo: '8. Incidentes de segurança',
            conteudo: `Em caso de incidente com risco relevante, notificaremos a ANPD em até 3 dias úteis
              e os titulares afetados, conforme Resolução CD/ANPD nº 15/2024.`,
          },
          {
            titulo: '9. Contato',
            conteudo: `Dúvidas ou solicitações: privacidade@fixfirst.io
              Encarregado de Dados (DPO): disponível no mesmo endereço.`,
          },
        ].map((s) => (
          <div key={s.titulo} className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">{s.titulo}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{s.conteudo}</p>
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
          © 2026 ResolveJá — fixfirst.io · <a href="/termos" className="hover:underline">Termos de Uso</a>
        </p>
      </div>
    </div>
  )
}
