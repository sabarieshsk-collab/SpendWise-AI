import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../src/config/swagger.js';

test('Swagger Documentation Test Suite', async (t) => {
  const app = express();
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (req, res) => {
    res.json(swaggerSpec);
  });

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  await t.test('OpenAPI Specification contains required metadata and endpoints', () => {
    assert.equal(swaggerSpec.openapi, '3.0.0');
    assert.equal(swaggerSpec.info.title, 'SpendWise AI — Backend API Documentation');

    const paths = swaggerSpec.paths;
    assert.ok(paths['/api/auth/register'].post, 'POST /api/auth/register must be documented');
    assert.ok(paths['/api/auth/login'].post, 'POST /api/auth/login must be documented');
    assert.ok(paths['/api/auth/me'].get, 'GET /api/auth/me must be documented');
    assert.ok(paths['/api/auth/logout'].post, 'POST /api/auth/logout must be documented');
    assert.ok(paths['/api/finance'].get, 'GET /api/finance must be documented');
    assert.ok(paths['/api/finance'].put, 'PUT /api/finance must be documented');
    assert.ok(paths['/api/ai/analyze-spending'].post, 'POST /api/ai/analyze-spending must be documented');

    // Security schemes check
    const sec = swaggerSpec.components.securitySchemes;
    assert.ok(sec.bearerAuth, 'bearerAuth must be defined');
    assert.ok(sec.cookieAuth, 'cookieAuth must be defined');
  });

  await t.test('GET /docs loads Swagger UI HTML', async () => {
    const res = await fetch(`${baseUrl}/docs/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('swagger-ui'), 'Swagger UI container should be rendered in HTML');
  });

  await t.test('GET /docs.json returns valid OpenAPI JSON schema', async () => {
    const res = await fetch(`${baseUrl}/docs.json`);
    assert.equal(res.status, 200);
    const spec = await res.json();
    assert.equal(spec.openapi, '3.0.0');
    assert.equal(spec.info.version, '1.0.0');
  });
});
