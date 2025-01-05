
export class AwsClient {
	async request(
		// string $httpVerb, string $bucket, string $key, array $headers, string $body = '', bool $throwOn404 = true): array
		verb = 'GET',
		bucket = '',
		key = '',
		headers = [],
		body = '',
	) {
			$uriPath = str_replace('%2F', '/', rawurlencode($key));
			$uriPath = '/' . ltrim($uriPath, '/');
			$queryString = '';
			$hostname = $this->getHostname($bucket);
			$headers['host'] = $hostname;
	
			// Sign the request via headers
			$headers = $this->signRequest($httpVerb, $uriPath, $queryString, $headers, $body);
	
			$url = `https://${hostname}/${key}?${queryString}`;
	
			return fetch(URL, requestInit);
	}

	signRequest(
        httpVerb,
        uriPath,
        queryString,
        headers,
        body
    ) {
        $dateAsText = gmdate('Ymd');
        $timeAsText = gmdate('Ymd\THis\Z');
        $scope = "$dateAsText/{$this->region}/s3/aws4_request";
        $bodySignature = hash('sha256', $body);

        $headers['x-amz-date'] = $timeAsText;
        $headers['x-amz-content-sha256'] = $bodySignature;
        if ($this->sessionToken) {
            $headers['x-amz-security-token'] = $this->sessionToken;
        }

        // Ensure the headers always have the same order to have a valid AWS signature
        $headers = $this->sortHeadersByName($headers);

        // https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
        $headerNamesAsString = implode(';', array_map('strtolower', array_keys($headers)));
        $headerString = '';
        foreach ($headers as $key => $value) {
            $headerString .= strtolower($key) . ':' . trim($value) . "\n";
        }

        $canonicalRequest = "$httpVerb\n$uriPath\n$queryString\n$headerString\n$headerNamesAsString\n$bodySignature";

        $stringToSign = "AWS4-HMAC-SHA256\n$timeAsText\n$scope\n" . hash('sha256', $canonicalRequest);
        $signingKey = hash_hmac(
            'sha256',
            'aws4_request',
            hash_hmac(
                'sha256',
                's3',
                hash_hmac(
                    'sha256',
                    $this->region,
                    hash_hmac('sha256', $dateAsText, 'AWS4' . $this->secretKey, true),
                    true,
                ),
                true,
            ),
            true,
        );
        $signature = hash_hmac('sha256', $stringToSign, $signingKey);

        $headers['authorization'] = "AWS4-HMAC-SHA256 Credential={$this->accessKeyId}/$scope,SignedHeaders=$headerNamesAsString,Signature=$signature";

        return $headers;
    }
}
