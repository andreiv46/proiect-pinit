import {BlobServiceClient} from "@azure/storage-blob";
import "dotenv/config"

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString!);

