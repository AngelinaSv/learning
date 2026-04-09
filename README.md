# File Service

A simple file upload/download service with quota management.

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3009`

## API Documentation

### File Routes

#### GET /files
Get list of all uploaded files.

**Response:**
```json
{
  "files": [
    {
      "filename": "example.txt",
      "status": "done",
      "size": 1024
    }
  ]
}
```

#### POST /files
Upload a file.

**Request:** `multipart/form-data`
- `file` (required): The file to upload

**Response (200):**
```json
{
  "message": "File uploaded successfully"
}
```

**Errors (400):** No file provided
**Errors (413):** Quota exceeded

#### GET /files/:filename
Download or view a file.

**Response:** File content with appropriate Content-Type header.

**Errors (404):** File not found

#### DELETE /files/:filename
Delete a file.

**Response:** 204 No Content

**Errors (404):** File not found

#### GET /files/:filename/status
Get upload status of a file.

**Response:**
```json
{
  "status": { "status": "done" }
}
```

### Quota Routes

#### GET /files/quota
Get current quota and usage.

**Response:**
```json
{
  "quota": 5242880,
  "used": 102400
}
```

#### POST /files/quota
Update storage quota.

**Request:**
```json
{
  "quota": 10485760
}
```

**Response (200):**
```json
{
  "quota": 10485760
}
```

**Errors (400):** Invalid quota value

## Web Interface

Visit `/` for the web interface with:
- Upload form
- File list with view/delete actions
- Quota display and management

## Error Responses

All errors return JSON:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Storage

Files are stored in the `./storage` directory with original filenames.
