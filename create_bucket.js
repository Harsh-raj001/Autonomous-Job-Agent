require('dotenv').config({ path: './apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || 'https://jwfrjfjrodwxpjqpdsny.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log("Checking buckets...");
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }
  
  const bucketName = 'resumes';
  const exists = buckets.some(b => b.name === bucketName);
  
  console.log(`Bucket '${bucketName}' exists? ${exists}`);
  
  if (!exists) {
    console.log(`Creating bucket '${bucketName}'...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error("Failed to create bucket:", error);
    } else {
      console.log("Bucket created successfully:", data);
    }
  }
}

createBucket();
