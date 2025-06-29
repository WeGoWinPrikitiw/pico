import _Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import Error "mo:base/Error";
import _Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Config "config";

module {
    // Types for HTTP outcalls
    public type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?{
            function : shared query ({
                status : Nat;
                headers : [HttpHeader];
                body : [Nat8];
            }) -> async ({ status : Nat; headers : [HttpHeader]; body : [Nat8] });
            context : [Nat8];
        };
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
        prompt : Text;
        model : Text; // "dall-e-3" or "dall-e-2"
        size : Text; // "256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"
        quality : Text; // "standard" or "hd"
        n : Nat; // Number of images to generate (1-10)
        response_format : Text; // "url" or "b64_json"
    };

    public type OpenAIImageResponse = {
        created : Nat;
        data : [OpenAIImageData];
    };

    public type OpenAIImageData = {
        url : ?Text;
        b64_json : ?Text;
        revised_prompt : ?Text;
    };

    public type OpenAIError = {
        error : {
            message : Text;
            type_ : Text;
            param : ?Text;
            code : ?Text;
        };
    };

    // AI Detection types
    public type AIDetectionRequest = {
        image_url : Text;
        detail : Text; // "low", "high", or "auto"
    };

    public type AIDetectionResponse = {
        is_ai_generated : Bool;
        confidence : Float;
        reasoning : Text;
    };

    public type ChatMessage = {
        role : Text; // "user", "assistant", "system"
        content : [ChatContent];
    };

    public type ChatContent = {
        #text : { text : Text };
        #image_url : { image_url : { url : Text; detail : ?Text } };
    };

    public type ChatCompletionRequest = {
        model : Text;
        messages : [ChatMessage];
        max_tokens : ?Nat;
        temperature : ?Float;
    };

    public type ChatCompletionResponse = {
        choices : [ChatChoice];
        usage : ?{
            prompt_tokens : Nat;
            completion_tokens : Nat;
            total_tokens : Nat;
        };
    };

    public type ChatChoice = {
        message : {
            role : Text;
            content : Text;
        };
        finish_reason : ?Text;
        index : Nat;
    };

    // HTTP outcall actor reference
    public let ic : actor {
        http_request : HttpRequestArgs -> async HttpResponsePayload;
    } = actor ("aaaaa-aa");

    // Simple JSON parsing function to extract image URL
    private func extractImageUrl(jsonText : Text) : Result.Result<Text, Text> {
        // Look for "url": pattern in the JSON response
        switch (Text.split(jsonText, #text "\"url\":")) {
            case (parts) {
                let partsArray = Iter.toArray(parts);
                if (partsArray.size() >= 2) {
                    // Get the part after "url":
                    let urlPart = partsArray[1];
                    // Look for the opening quote
                    switch (Text.split(urlPart, #text "\"")) {
                        case (urlParts) {
                            let urlPartsArray = Iter.toArray(urlParts);
                            if (urlPartsArray.size() >= 2) {
                                // The URL should be between the first two quotes
                                let imageUrl = urlPartsArray[1];
                                #ok(imageUrl);
                            } else {
                                #err("Could not parse URL from response");
                            };
                        };
                    };
                } else {
                    #err("No URL found in response");
                };
            };
        };
    };

    // Parse AI detection response from GPT-4 Vision
    private func parseAIDetectionResponse(responseText : Text) : Result.Result<AIDetectionResponse, Text> {
        // Look for the content in the JSON response
        switch (Text.split(responseText, #text "\"content\":")) {
            case (parts) {
                let partsArray = Iter.toArray(parts);
                if (partsArray.size() >= 2) {
                    let contentPart = partsArray[1];
                    // Extract the actual content between quotes
                    switch (Text.split(contentPart, #text "\"")) {
                        case (contentParts) {
                            let contentPartsArray = Iter.toArray(contentParts);
                            if (contentPartsArray.size() >= 2) {
                                let content = contentPartsArray[1];
                                
                                // Convert to lowercase for case-insensitive matching
                                let contentLower = Text.map(content, func(c : Char) : Char {
                                    if (c >= 'A' and c <= 'Z') {
                                        Char.fromNat32(Char.toNat32(c) + 32)
                                    } else {
                                        c
                                    }
                                });
                                
                                // Look for the structured response format first
                                let isAI = if (Text.contains(contentLower, #text "yes - this image is ai-generated")) {
                                    true
                                } else if (Text.contains(contentLower, #text "no - this image is not ai-generated")) {
                                    false
                                } else if (Text.contains(contentLower, #text "yes") and 
                                          (Text.contains(contentLower, #text "ai-generated") or 
                                           Text.contains(contentLower, #text "ai generated"))) {
                                    true
                                } else if (Text.contains(contentLower, #text "no") and 
                                          (Text.contains(contentLower, #text "ai-generated") or 
                                           Text.contains(contentLower, #text "ai generated"))) {
                                    false
                                } else if (Text.contains(contentLower, #text "this is definitely an ai-generated") or
                                          Text.contains(contentLower, #text "this is clearly an ai-generated") or
                                          Text.contains(contentLower, #text "definitely ai-generated") or
                                          Text.contains(contentLower, #text "clearly ai-generated")) {
                                    true
                                } else if (Text.contains(contentLower, #text "this image is ai-generated") or
                                          Text.contains(contentLower, #text "this is an ai-generated") or
                                          Text.contains(contentLower, #text "appears to be ai-generated")) {
                                    true
                                } else if (Text.contains(contentLower, #text "this image is not ai-generated") or
                                          Text.contains(contentLower, #text "this is not an ai-generated") or
                                          Text.contains(contentLower, #text "appears to be a natural") or
                                          Text.contains(contentLower, #text "real photograph") or
                                          Text.contains(contentLower, #text "natural photograph") or
                                          Text.contains(contentLower, #text "clearly a real")) {
                                    false
                                } else {
                                    // Default fallback - be conservative and assume not AI if unclear
                                    false
                                };
                                
                                // Determine confidence based on response certainty
                                let confidence : Float = if (Text.contains(contentLower, #text "definitely") or 
                                                           Text.contains(contentLower, #text "clearly") or
                                                           Text.contains(contentLower, #text "certainly") or
                                                           Text.contains(contentLower, #text "obvious")) {
                                    0.9
                                } else if (Text.contains(contentLower, #text "likely") or 
                                          Text.contains(contentLower, #text "probably") or
                                          Text.contains(contentLower, #text "appears") or
                                          Text.contains(contentLower, #text "strong")) {
                                    0.75
                                } else if (Text.contains(contentLower, #text "possibly") or 
                                          Text.contains(contentLower, #text "might") or
                                          Text.contains(contentLower, #text "could be") or
                                          Text.contains(contentLower, #text "somewhat")) {
                                    0.5
                                } else {
                                    0.65
                                };

                                #ok({
                                    is_ai_generated = isAI;
                                    confidence = confidence;
                                    reasoning = content;
                                });
                            } else {
                                #err("Could not parse content from response");
                            };
                        };
                    };
                } else {
                    #err("No content found in response");
                };
            };
        };
    };

    // Generate image using OpenAI API
    public func generateImage(apiKey : Text, request : OpenAIImageRequest) : async Result.Result<Text, Text> {

        // Escape quotes in prompt to prevent JSON issues
        let escapedPrompt = Text.replace(request.prompt, #text "\"", "\\\"");

        // Prepare the request body
        let requestBody = "{" #
        "\"model\":\"" # request.model # "\"," #
        "\"prompt\":\"" # escapedPrompt # "\"," #
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
            { name = "User-Agent"; value = "PiCO-NFT/1.0" },
        ];

        // Prepare HTTP request with centralized configuration
        let httpRequest : HttpRequestArgs = {
            url = "https://api.openai.com/v1/images/generations";
            max_response_bytes = ?Nat64.fromNat(Config.HTTP_MAX_RESPONSE_BYTES);
            headers = headers;
            body = ?requestBodyBytes;
            method = #post;
            transform = null; // Simplified for now - no transform function
        };

        try {
            // Make the HTTP outcall and attach cycles directly
            let httpResponse = await (with cycles = Config.HTTP_OUTCALL_CYCLES) ic.http_request(httpRequest);

            // Convert response body to text
            let responseText = switch (Text.decodeUtf8(Blob.fromArray(httpResponse.body))) {
                case (?text) text;
                case null { return #err("Invalid UTF-8 response") };
            };

            // Handle different HTTP status codes
            if (httpResponse.status == 200) {
                // Parse JSON response to extract image URL
                switch (extractImageUrl(responseText)) {
                    case (#ok(url)) #ok(url);
                    case (#err(parseError)) {
                        // If parsing fails, return the full response for debugging
                        #err("JSON parsing failed: " # parseError # ". Response: " # responseText);
                    };
                };
            } else if (httpResponse.status == 401) {
                #err("Authentication failed: Invalid API key");
            } else if (httpResponse.status == 429) {
                #err("Rate limit exceeded: Too many requests");
            } else if (httpResponse.status >= 400 and httpResponse.status < 500) {
                #err("Client error (HTTP " # Nat.toText(httpResponse.status) # "): " # responseText);
            } else if (httpResponse.status >= 500) {
                #err("Server error (HTTP " # Nat.toText(httpResponse.status) # "): OpenAI service unavailable");
            } else {
                #err("Unexpected response (HTTP " # Nat.toText(httpResponse.status) # "): " # responseText);
            };
        } catch (error) {
            #err("HTTP request failed: " # Error.message(error));
        };
    };

    // Simplified image generation for testing (without HTTP outcalls)
    public func generateImageMock(prompt : Text) : async Text {
        // Return a mock image URL for testing
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1024&h=1024&fit=crop&q=80&prompt=" # prompt;
    };

    // Detect AI-generated images using GPT-4 Vision
    public func detectAIGenerated(apiKey : Text, imageUrl : Text) : async Result.Result<AIDetectionResponse, Text> {
        
        // Create the system prompt for AI detection
        let systemPrompt = "You are an expert at detecting AI-generated images. Analyze the provided image carefully and determine if it was created by an AI image generator or if it's a natural photograph/traditional artwork. Look for AI generation indicators like unrealistic details, inconsistent lighting, artifacts, or unnatural compositions. Always start your response with either 'YES - this image is AI-generated' or 'NO - this image is not AI-generated' followed by detailed reasoning.";
        
        let userPrompt = "Is this image AI-generated? Start your answer with either 'YES - this image is AI-generated' or 'NO - this image is not AI-generated' then explain your reasoning.";

        // Prepare the chat completion request
        let requestBody = "{" #
        "\"model\":\"gpt-4o\"," #
        "\"messages\":[" #
        "{\"role\":\"system\",\"content\":\"" # systemPrompt # "\"}," #
        "{\"role\":\"user\",\"content\":[" #
        "{\"type\":\"text\",\"text\":\"" # userPrompt # "\"}," #
        "{\"type\":\"image_url\",\"image_url\":{\"url\":\"" # imageUrl # "\",\"detail\":\"high\"}}" #
        "]}" #
        "]," #
        "\"max_tokens\":300," #
        "\"temperature\":0.1" #
        "}";

        let requestBodyBytes = Blob.toArray(Text.encodeUtf8(requestBody));

        // Prepare headers
        let headers : [HttpHeader] = [
            { name = "Content-Type"; value = "application/json" },
            { name = "Authorization"; value = "Bearer " # apiKey },
            { name = "User-Agent"; value = "PiCO-NFT/1.0" },
        ];

        // Prepare HTTP request
        let httpRequest : HttpRequestArgs = {
            url = "https://api.openai.com/v1/chat/completions";
            max_response_bytes = ?Nat64.fromNat(Config.HTTP_MAX_RESPONSE_BYTES);
            headers = headers;
            body = ?requestBodyBytes;
            method = #post;
            transform = null;
        };

        try {
            // Make the HTTP outcall
            let httpResponse = await (with cycles = Config.HTTP_OUTCALL_CYCLES) ic.http_request(httpRequest);

            // Convert response body to text
            let responseText = switch (Text.decodeUtf8(Blob.fromArray(httpResponse.body))) {
                case (?text) text;
                case null { return #err("Invalid UTF-8 response") };
            };

            // Handle different HTTP status codes
            if (httpResponse.status == 200) {
                // Parse the AI detection response
                switch (parseAIDetectionResponse(responseText)) {
                    case (#ok(detection)) #ok(detection);
                    case (#err(parseError)) {
                        #err("Failed to parse AI detection response: " # parseError # ". Response: " # responseText);
                    };
                };
            } else if (httpResponse.status == 401) {
                #err("Authentication failed: Invalid API key");
            } else if (httpResponse.status == 429) {
                #err("Rate limit exceeded: Too many requests");
            } else if (httpResponse.status >= 400 and httpResponse.status < 500) {
                #err("Client error (HTTP " # Nat.toText(httpResponse.status) # "): " # responseText);
            } else if (httpResponse.status >= 500) {
                #err("Server error (HTTP " # Nat.toText(httpResponse.status) # "): OpenAI service unavailable");
            } else {
                #err("Unexpected response (HTTP " # Nat.toText(httpResponse.status) # "): " # responseText);
            };
        } catch (error) {
            #err("HTTP request failed: " # Error.message(error));
        };
    };

    // Mock AI detection for testing (returns random result)
    public func detectAIGeneratedMock(imageUrl : Text) : async AIDetectionResponse {
        // Simple heuristic: if URL contains "ai", "generated", or "dall-e", mark as AI
        let isAI = Text.contains(imageUrl, #text "ai") or 
                  Text.contains(imageUrl, #text "generated") or
                  Text.contains(imageUrl, #text "dall-e") or
                  Text.contains(imageUrl, #text "midjourney");
        
        {
            is_ai_generated = isAI;
            confidence = if (isAI) 0.85 else 0.75;
            reasoning = if (isAI) {
                "The image URL suggests this is an AI-generated image based on naming patterns."
            } else {
                "The image appears to be a natural photograph or traditional artwork."
            };
        };
    };

    // Helper function to create OpenAI request
    public func createImageRequest(
        prompt : Text,
        size : ?Text,
        quality : ?Text,
        model : ?Text,
    ) : OpenAIImageRequest {
        {
            prompt = prompt;
            model = switch (model) { case (?m) m; case null "dall-e-3" }; // Use DALL-E 3 by default
            size = switch (size) { case (?s) s; case null "1024x1024" };
            quality = switch (quality) { case (?q) q; case null "standard" };
            n = 1;
            response_format = "url";
        };
    };
};
