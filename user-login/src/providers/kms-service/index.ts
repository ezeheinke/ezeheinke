import * as R from "@lib/result-pattern";
import { KmsServiceError, toKmsServiceError } from "./errors";

interface KmsService {
  getSecretKey(): Promise<R.Result<KmsServiceError, string>>;
}

const getSecretKey: KmsService["getSecretKey"] = async () => {
  try {
    // call KMS, get secret key
    return R.toSuccess("secret-key");
  } catch (error) {
    return R.toFailure(toKmsServiceError({ error, reason: "apiCallFailed" }));
  }
};

const kmsService: KmsService = {
  getSecretKey,
};

export default kmsService;
