import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"
import { compile } from 'handlebars';
import dayjs from 'dayjs';
import { join } from 'path';
import { readFileSync } from "fs"
import chromium  from "chrome-aws-lambda"
import { S3 } from "aws-sdk";

interface ICreatePdf {
    id: string;
    name: string;
    email: string;
}

interface ITemplate {
    id: string;
    name: string;
    email: string;
    date: string;
}

const compileTemplate = async (data: ITemplate) => {
    const filePath = join(process.cwd(), "src", "templates", "pdfuser.hbs")
    const html = readFileSync(filePath, "utf-8");
    
    return compile(html)(data);
}

export const handler: APIGatewayProxyHandler = async (event) => {

    const { id, name, email } = JSON.parse(event.body) as ICreatePdf

    const response = await document.query({
        TableName: "pdf_users",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userAlreadyExists = response.Items[0];
    if (!userAlreadyExists) {
        await document.put({
            TableName: "pdf_users",
            Item: {
                id,
                name,
                email,
                created_at: new Date().getTime()
            }
        }).promise();
    }
  
    const data: ITemplate = {
        name,
        id,
        email,
        date: dayjs().format("DD/MM/YYYY")
    }

    const content = await compileTemplate(data)
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
    });

    const page = await browser.newPage();
    await page.setContent(content);
    const pdf = await page.pdf({
        format: "a4",
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        path: process.env.IS_OFFLINE ? "./user_pdf.pdf" : null
    })

    await browser.close();

    const s3 = new S3();

    // await s3.createBucket({
    //     Bucket: "generatepdfuser"
    // }).promise()

    await s3.putObject({
        Bucket: "generatepdfuser",
        Key: `${id}.pdf`,
        ACL: "public-read",
        Body: pdf,
        ContentType: "application/pdf"
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify({
            message: "PDF Gerado com sucesso!",
            url: `https://generatepdfuser.s3.us-east-1.amazonaws.com/${id}.pdf`
        })
    }
}