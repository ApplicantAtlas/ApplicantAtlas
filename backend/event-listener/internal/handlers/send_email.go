package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/smtp"
	"shared/kafka"
	"shared/mongodb"
	"strings"

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

func (s SendEmailHandler) HandleAction(action kafka.PipelineActionMessage) error {
	sendEmailAction, ok := action.(*kafka.SendEmailMessage)
	if !ok {
		return errors.New("invalid action type for SendEmailHandler")
	}

	// Read event secret data
	secretData, err := s.mongo.GetEventSecrets(context.TODO(), bson.M{"eventID": sendEmailAction.EventID}, false)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// No event secrets found
			return ErrRequiredSecretNotFound
		}
		return err
	}

	smtpConfig := secretData.Email
	if smtpConfig == nil {
		return ErrRequiredSecretNotFound
	}

	// Get email template
	emailTemplate, err := s.mongo.GetEmailTemplate(context.TODO(), sendEmailAction.EmailTemplateID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrEmailTemplateNotFound
		}
		return err
	}

	// Let's resolve to using the email template's To field against the form data
	var to string
	if sendEmailAction.Data == nil {
		return ErrNoToEmailFound
	}

	if email, ok := sendEmailAction.Data[sendEmailAction.EmailFieldID]; ok {
		to = email.(string)
	} else {
		return ErrNoToEmailFound
	}

	toAddresses := []string{to}
	toHeader := "To: " + strings.Join(toAddresses, ", ") + "\r\n"

	// TODO: BCC & CC
	//to = append(to, emailTemplate.CC...)
	//to = append(to, emailTemplate.BCC...)

	// Prepare the email headers and body
	subject := "Subject: " + emailTemplate.Subject + "\r\n"
	from := "From: " + emailTemplate.From + "\r\n"

	var replyTo string
	if emailTemplate.ReplyTo != "" {
		replyTo = "Reply-To: " + emailTemplate.ReplyTo + "\r\n"
	} else {
		replyTo = "Reply-To: " + emailTemplate.From + "\r\n"
	}

	dateHeader := "Date: " + emailTemplate.UpdatedAt.Format("Mon, 02 Jan 2006 15:04:05 -0700") + "\r\n"
	messageID := fmt.Sprintf("Message-ID: <%s@%s>\r\n", uuid.NewString(), smtpConfig.SMTPServer)

	var body string = emailTemplate.Body
	mime := "MIME-Version: 1.0\r\n"
	if emailTemplate.IsHTML {
		mime += "Content-Type: text/html; charset=\"UTF-8\"\r\n"
		body = "<html><body>" + emailTemplate.Body + "</body></html>"
	} else {
		mime += "Content-Type: text/plain; charset=\"UTF-8\"\r\n"
	}

	message := []byte(subject + from + toHeader + replyTo + dateHeader + messageID + mime + "\r\n" + body)

	// SMTP server configuration
	smtpHost := smtpConfig.SMTPServer
	smtpPort := fmt.Sprintf("%d", smtpConfig.Port)
	address := smtpHost + ":" + smtpPort

	// Authentication
	auth := smtp.PlainAuth("", smtpConfig.Username, smtpConfig.Password, smtpHost)

	// Sending email
	err = smtp.SendMail(address, auth, emailTemplate.From, toAddresses, message)
	if err != nil {
		return err
	}

	fmt.Println("Email sent successfully!")
	return nil
}
