aws iam create-user --user-name uvucs3660-s3-user

aws iam create-access-key --user-name uvucs3660-s3-user

aws iam put-user-policy \
    --user-name uvucs3660-s3-user \
    --policy-name uvucs3660-s3-access \
    --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::project3-team5",
                "arn:aws:s3:::project3-team5/*"
            ]
        }
    ]
}'