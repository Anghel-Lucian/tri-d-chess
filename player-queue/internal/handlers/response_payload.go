package handlers

type ResponsePayload struct {
    Message string `json:"message"`
    Data any `json:"data,omitempty"`
    Ack *bool `json:"ack,omitempty"`
}

