import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";

module {
    // Types for HTTP outcalls
    public type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?TransformRawResponseFunction;
    };

    public type HttpHeader = {
        name : Text;
        value : Text;
    };

    public type HttpMethod = {
        #get;
        #post;
        #head;
    };

    public type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    public type TransformRawResponseFunction = {
        function : shared query TransformRawResponse -> async HttpResponsePayload;
        context : Blob;
    };

    public type TransformRawResponse = {
        status : Nat;
        body : [Nat8];
        headers : [HttpHeader];
        context : Blob;
    };

    // OpenAI specific types
    public type OpenAIImageRequest = {
        prompt: Text;
        model: Text; // "gpt-image-1" or "dall-e-3"
        size: Text; // "1024x1024", "1792x1024", "1024x1792"
        quality: Text; // "standard" or "hd"
        n: Nat; // number of images (1-10 for DALL-E 2, only 1 for DALL-E 3)
        response_format: Text; // "url" or "b64_json"
    };

    public type OpenAIImageResponse = {
        created: Nat;
        data: [OpenAIImageData];
    };

    public type OpenAIImageData = {
        url: ?Text;
        b64_json: ?Text;
        revised_prompt: ?Text;
    };

    public type OpenAIError = {
        error: {
            message: Text;
            type_: Text;
            param: ?Text;
            code: ?Text;
        };
    };

    // HTTP outcall actor reference
    public let ic : actor {
        http_request : HttpRequestArgs -> async HttpResponsePayload;
    } = actor ("aaaaa-aa");

    // Transform function for HTTP outcalls
    public query func transform(raw : TransformRawResponse) : async HttpResponsePayload {
        let headers : [HttpHeader] = [
            {
                name = "content-security-policy";
                value = "default-src 'self'";
            },
            { name = "referrer-policy"; value = "strict-origin" },
            { name = "permissions-policy"; value = "geolocation=()" },
        ];
        { status = raw.status; body = raw.body; headers = headers }
    };

    // Generate image using OpenAI API
    public func generateImage(apiKey: Text, request: OpenAIImageRequest) : async Text {
        
        // Prepare the request body
        let requestBody = "{" #
            "\"model\":\"" # request.model # "\"," #
            "\"prompt\":\"" # request.prompt # "\"," #
            "\"size\":\"" # request.size # "\"," #
            "\"quality\":\"" # request.quality # "\"," #
            "\"n\":" # Nat.toText(request.n) # "," #
            "\"response_format\":\"" # request.response_format # "\"" #
        "}";

        let requestBodyBytes = Blob.toArray(Text.encodeUtf8(requestBody));

        // Prepare headers
        let headers : [HttpHeader] = [
            { name = "Content-Type"; value = "application/json" },
            { name = "Authorization"; value = "Bearer " # apiKey },
            { name = "User-Agent"; value = "Pico-NFT/1.0" }
        ];

        // Prepare HTTP request
        let httpRequest : HttpRequestArgs = {
            url = "https://api.openai.com/v1/images/generations";
            max_response_bytes = ?2048; // 2KB max response
            headers = headers;
            body = ?requestBodyBytes;
            method = #post;
            transform = ?{
                function = transform;
                context = Blob.fromArray([]);
            };
        };

        // Add cycles for HTTP outcall (approximately 200M cycles)
        Cycles.add(200_000_000);

        try {
            // Make the HTTP outcall
            let httpResponse = await ic.http_request(httpRequest);
            
            // Convert response body to text
            let responseText = switch (Text.decodeUtf8(Blob.fromArray(httpResponse.body))) {
                case (?text) text;
                case null "Invalid UTF-8 response";
            };

            // In a real implementation, you would parse the JSON response
            // For now, we'll return a simplified response
            if (httpResponse.status == 200) {
                // Parse JSON and extract image URL (simplified)
                // In reality, you'd use a JSON parser
                responseText
            } else {
                "Error: HTTP " # Nat.toText(httpResponse.status) # " - " # responseText
            }
        } catch (error) {
            "Error making HTTP request: " # Error.message(error)
        }
    };

    // Simplified image generation for testing (without HTTP outcalls)
    public func generateImageMock(prompt: Text) : async Text {
        // Return a mock image URL for testing
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1024&h=1024&fit=crop&q=80&prompt=" # prompt
    };

    // Helper function to create OpenAI request
    public func createImageRequest(
        prompt: Text, 
        size: ?Text, 
        quality: ?Text, 
        model: ?Text
    ) : OpenAIImageRequest {
        {
            prompt = prompt;
            model = switch (model) { case (?m) m; case null "gpt-image-1"; };
            size = switch (size) { case (?s) s; case null "1024x1024"; };
            quality = switch (quality) { case (?q) q; case null "standard"; };
            n = 1;
            response_format = "url";
        }
    };
} 