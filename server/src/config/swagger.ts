import swaggerJSDoc from "swagger-jsdoc"

const options : swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: '3.1.1',
    tags: [
      {
        name: 'Products',
        description: 'API operations related to products'
      }
    ],
    info: {
      title: 'REST API Node.js / Express / Typescript',
      version: '1.0.0',
      description: 'API Docs for Products'
    }
  },
  apis: ['./src/router.ts']
}

const swaggerSpec = swaggerJSDoc(options)
export default swaggerSpec