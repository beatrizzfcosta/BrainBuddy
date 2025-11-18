# Como Testar o Gemini API

## Método 1: Interface Swagger (Mais Fácil) 🎯

### Passo a Passo:

1. **Acesse a documentação:**
   ```
   http://localhost:8000/docs
   ```

2. **Encontre a seção "Gemini"** (no menu lateral)

3. **Clique em `POST /api/gemini/generate`**

4. **Clique no botão "Try it out"**

5. **Preencha o Request Body** com este exemplo:
   ```json
   {
     "prompt": "Explique o que são vetores em matemática de forma simples",
     "topic_id": "topic123",
     "context": "Estamos estudando álgebra linear"
   }
   ```
   **Nota:** O prompt deve solicitar uma explicação, não uma pergunta direta.

6. **Clique em "Execute"**

7. **Veja a resposta** na seção "Response body"

### Exemplo de Request Body Completo:
```json
{
  "prompt": "O que é Python?",
  "topic_id": "programming_1",
  "slide_id": null,
  "context": "Estamos aprendendo programação"
}
```

### Campos do Request:
- **`prompt`** (obrigatório): O tópico ou conceito para o Gemini explicar
- **`topic_id`** (opcional): ID do tópico relacionado
- **`slide_id`** (opcional): ID do slide relacionado
- **`context`** (opcional): Contexto adicional para melhorar a resposta

---

## Método 2: Usando cURL (Terminal) 💻

### Exemplo Básico:
```bash
curl -X POST "http://localhost:8000/api/gemini/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explique o que são vetores"
  }'
```

### Exemplo Completo:
```bash
curl -X POST "http://localhost:8000/api/gemini/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crie um resumo sobre fotossíntese",
    "topic_id": "biology_topic_1",
    "context": "Estamos estudando biologia celular"
  }'
```

---

## Método 3: Usando Python 🐍

```python
import requests

url = "http://localhost:8000/api/gemini/generate"
data = {
    "prompt": "Explique o conceito de derivadas",
    "topic_id": "math_topic_1",
    "context": "Estamos estudando cálculo"
}

response = requests.post(url, json=data)
print(response.json())
```

---

## Outros Endpoints do Gemini

### 1. Gerar Resumo (`/api/gemini/summarize`)

**Na Swagger:**
- Vá em `POST /api/gemini/summarize`
- Preencha:
  ```json
  {
    "content": "Texto longo aqui que você quer resumir...",
    "topic_id": "topic123"
  }
  ```

**Com cURL:**
```bash
curl -X POST "http://localhost:8000/api/gemini/summarize" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Texto muito longo aqui...",
    "topic_id": "topic123"
  }'
```


---

## Exemplos de Prompts para Testar

### 1. Explicação Simples:
```json
{
  "prompt": "O que é Python?"
}
```

### 2. Explicação de Conceito com Contexto:
```json
{
  "prompt": "Explique o que são derivadas em cálculo",
  "context": "Estamos estudando cálculo diferencial"
}
```

### 3. Resumo de Conteúdo:
```json
{
  "prompt": "Crie um resumo sobre a Revolução Francesa",
  "topic_id": "history_topic_1"
}
```


---

## Resposta Esperada

Quando funcionar corretamente, você receberá uma resposta assim:

```json
{
  "response": "Vetores são objetos matemáticos que possuem tanto magnitude quanto direção...",
  "prompt": "Explique o que são vetores",
  "topic_id": "topic123",
  "slide_id": null
}
```

---

## Troubleshooting

### Erro: "GEMINI_API_KEY não configurado"
- Verifique se a chave está no arquivo `.env` na raiz do projeto
- Reinicie o container: `docker-compose restart backend`

### Erro: "Erro ao gerar resposta: 400"
- Verifique se a API Key está válida
- Tente um prompt mais curto

### Erro: "429 Too Many Requests"
- Você excedeu o limite de requisições
- Aguarde alguns minutos antes de tentar novamente

### Resposta vazia
- Tente reformular o prompt
- Adicione mais contexto

---

## Dicas

1. **Use contexto**: Adicionar `context` melhora a qualidade das respostas
2. **Seja específico**: Prompts mais específicos geram melhores respostas
3. **Teste diferentes formatos**: Tente explicações de conceitos, comandos de resumo, ou tópicos específicos
4. **Monitore o uso**: A API gratuita tem limites de requisições

---

**Pronto para testar!** 🚀

