package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/smtp"
	"strings"
	"time"

	"shared/kafka"
	"shared/mongodb"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrRequiredSecretNotFound = errors.New("event secrets not found")
	ErrEmailTemplateNotFound  = errors.New("email template not found")
	ErrNoToEmailFound         = errors.New("no email found in the form data")
)

type SendEmailHandler struct {
	mongo *mongodb.Service
}

func NewSendEmailHandler(mongo *mongodb.Service) *SendEmailHandler {
	return &SendEmailHandler{mongo: mongo}
}

func (s *SendEmailHandler) HandleAction(action kafka.PipelineActionMessage) error {
	sendEmailAction, ok := action.(*kafka.SendEmailMessage)
	if !ok {
		return errors.New("invalid action type for SendEmailHandler")
	}

	secretData, err := s.mongo.GetEventSecrets(context.TODO(), bson.M{"eventID": sendEmailAction.EventID}, false)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrRequiredSecretNotFound
		}
		return err
	}

	smtpConfig := secretData.Email
	if smtpConfig == nil {
		return ErrRequiredSecretNotFound
	}

	emailTemplate, err := s.mongo.GetEmailTemplate(context.TODO(), sendEmailAction.EmailTemplateID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrEmailTemplateNotFound
		}
		return err
	}

	if sendEmailAction.Data == nil {
		return ErrNoToEmailFound
	}

	to, ok := sendEmailAction.Data[sendEmailAction.EmailFieldID].(string)
	if !ok {
		return ErrNoToEmailFound
	}

	toAddresses := []string{to}
	ccAddresses := emailTemplate.CC
	bccAddresses := emailTemplate.BCC

	// Create headers
	toHeader := "To: " + strings.Join(toAddresses, ", ") + "\r\n"
	ccHeader := "Cc: " + strings.Join(ccAddresses, ", ") + "\r\n"

	subject := "Subject: " + emailTemplate.Subject + "\r\n"
	from := "From: " + emailTemplate.From + "\r\n"

	if emailTemplate.ReplyTo == "" {
		emailTemplate.ReplyTo = emailTemplate.From
	}
	replyTo := "Reply-To: " + emailTemplate.ReplyTo + "\r\n"

	dateHeader := "Date: " + time.Now().Format(time.RFC1123Z) + "\r\n"
	messageID := fmt.Sprintf("Message-ID: <%s@%s>\r\n", uuid.NewString(), smtpConfig.SMTPServer)

	// MIME and Body
	mime := "MIME-Version: 1.0\r\n"
	contentType := "Content-Type: text/plain; charset=\"UTF-8\"\r\n"
	body := emailTemplate.Body
	if emailTemplate.IsHTML {
		contentType = "Content-Type: text/html; charset=\"UTF-8\"\r\n"
		body = "<html><body>" + body + "</body></html>"
	}

	// Compile email message
	message := []byte(subject + from + toHeader + ccHeader + replyTo + dateHeader + messageID + mime + contentType + "\r\n" + body)

	// SMTP server configuration
	smtpHost := smtpConfig.SMTPServer
	smtpPort := fmt.Sprintf("%d", smtpConfig.Port)
	address := smtpHost + ":" + smtpPort

	// Authentication
	auth := smtp.PlainAuth("", smtpConfig.Username, smtpConfig.Password, smtpHost)

	// Combine all recipients for sending
	allRecipients := append(toAddresses, ccAddresses...)
	allRecipients = append(allRecipients, bccAddresses...)

	// Send email
	err = smtp.SendMail(address, auth, emailTemplate.From, allRecipients, message)
	if err != nil {
		return err
	}

	return nil
}
