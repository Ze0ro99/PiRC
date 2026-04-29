import type { Lambda } from '../lambda';
import type { DeserializeBuildOutputConfig, DeserializeBuildOutputOptions, DeserializeBuildOutputResult } from './deserialize-build-output-types';
export declare function validateDeploymentId(deploymentId?: string): void;
export declare function deserializeBuildOutput<TConfig extends DeserializeBuildOutputConfig = DeserializeBuildOutputConfig, TResult extends DeserializeBuildOutputResult = DeserializeBuildOutputResult, TLambda extends Lambda = Lambda>(options: DeserializeBuildOutputOptions<TResult, TLambda>): Promise<TResult>;
