package io.fixfirst.resolveja.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    @Async
    public void enviarRecuperacaoSenha(String destinatario, String nome, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(destinatario);
            message.setSubject("ResolveJá — Recuperação de senha");
            message.setText("""
                    Olá, %s!

                    Recebemos uma solicitação para redefinir a senha da sua conta ResolveJá.

                    Acesse o link abaixo para criar uma nova senha (válido por 1 hora):
                    https://fixfirst.io/redefinir-senha?token=%s

                    Se você não solicitou a recuperação, ignore este e-mail.

                    Equipe ResolveJá
                    """.formatted(nome, token));
            mailSender.send(message);
        } catch (Exception e) {
            // Não bloqueia a operação principal se o e-mail falhar
            log.error("Falha ao enviar e-mail de recuperação para {}: {}", destinatario, e.getMessage());
        }
    }

    @Async
    public void enviarNotificacaoOrcamento(String destinatario, String nomePrestador, String statusOrcamento) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(destinatario);
            message.setSubject("ResolveJá — Orçamento " + statusOrcamento.toLowerCase());
            message.setText("""
                    Olá, %s!

                    Um orçamento seu foi %s pelo cliente.

                    Acesse sua conta para visualizar os detalhes:
                    https://fixfirst.io/orcamentos

                    Equipe ResolveJá
                    """.formatted(nomePrestador, statusOrcamento.toLowerCase()));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de notificação para {}: {}", destinatario, e.getMessage());
        }
    }
}
