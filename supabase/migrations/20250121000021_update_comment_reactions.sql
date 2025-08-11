-- Update comment_reactions table to only support like and dislike
-- First, delete any existing reactions that are not like or dislike
DELETE FROM comment_reactions 
WHERE reaction_type NOT IN ('like', 'dislike');

-- Update the check constraint to only allow like and dislike
ALTER TABLE comment_reactions 
DROP CONSTRAINT comment_reactions_reaction_type_check;

ALTER TABLE comment_reactions 
ADD CONSTRAINT comment_reactions_reaction_type_check 
CHECK (reaction_type IN ('like', 'dislike')); 