export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
          <p className="text-sm text-gray-500 mt-2">Última atualização: outubro de 2026</p>
        </div>

        {[
          {
            titulo: '1. Aceitação',
            conteudo: `Ao criar uma conta no ResolveJá, você concorda com estes Termos de Uso.
              Se não concordar, não utilize a plataforma.`,
          },
          {
            titulo: '2. O serviço',
            conteudo: `O ResolveJá é uma plataforma SaaS para gestão de serviços, clientes, orçamentos,
              agenda e financeiro voltada a prestadores de serviços autônomos.
              Oferecemos plano gratuito para uso individual.`,
          },
          {
            titulo: '3. Conta e responsabilidades',
            conteudo: `Você é responsável por:
              • Manter a confidencialidade de suas credenciais de acesso.
              • Toda a atividade realizada em sua conta.
              • Garantir que os dados dos seus clientes inseridos na plataforma foram coletados com base legal adequada.
              Você atua como controlador dos dados de seus clientes; o ResolveJá opera como operador conforme Art. 39 LGPD.`,
          },
          {
            titulo: '4. Uso permitido',
            conteudo: `A plataforma deve ser usada apenas para fins lícitos relacionados à gestão do seu negócio.
              É proibido: usar para fins ilegais, compartilhar a conta com terceiros,
              realizar engenharia reversa, ou tentar comprometer a segurança da plataforma.`,
          },
          {
            titulo: '5. Dados dos seus clientes',
            conteudo: `Você é o controlador dos dados pessoais de seus clientes inseridos na plataforma.
              É sua responsabilidade ter base legal para tratá-los (Art. 7 LGPD) e,
              quando necessário, obter o consentimento deles.
              O ResolveJá não acessa esses dados para fins comerciais próprios.`,
          },
          {
            titulo: '6. Disponibilidade',
            conteudo: `Buscamos manter a plataforma disponível 24/7, mas não garantimos disponibilidade ininterrupta.
              Manutenções podem ocorrer com aviso prévio sempre que possível.`,
          },
          {
            titulo: '7. Limitação de responsabilidade',
            conteudo: `O ResolveJá não se responsabiliza por perdas de dados decorrentes de uso indevido,
              falhas causadas por terceiros, ou eventos de força maior.
              Recomendamos exportar regularmente seus dados.`,
          },
          {
            titulo: '8. Encerramento de conta',
            conteudo: `Você pode encerrar sua conta a qualquer momento pela página de configurações.
              O encerramento anonimiza seus dados pessoais conforme nossa Política de Privacidade.`,
          },
          {
            titulo: '9. Alterações',
            conteudo: `Podemos atualizar estes termos com aviso de 15 dias para mudanças materiais.
              O uso continuado após o prazo constitui aceitação dos novos termos.`,
          },
          {
            titulo: '10. Foro',
            conteudo: `Estes Termos são regidos pela legislação brasileira. Para resolução de conflitos,
              fica eleito o foro da Comarca de São Paulo — SP.`,
          },
        ].map((s) => (
          <div key={s.titulo} className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">{s.titulo}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{s.conteudo}</p>
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
          © 2026 ResolveJá — fixfirst.io · <a href="/privacidade" className="hover:underline">Política de Privacidade</a>
        </p>
      </div>
    </div>
  )
}
