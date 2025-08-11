-- Update prompt_fields table to remove the required column since all fields are required
ALTER TABLE "public"."prompt_fields" DROP COLUMN "required"; 