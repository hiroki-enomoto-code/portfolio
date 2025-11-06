<?php

namespace App\Libs;

class SlackUtils
{

	private static $is_error = false;
	private static $errors = [];

    protected static function _request($end_point = null, $params = [])
	{
		$query = http_build_query($params);
		$url = 'https://slack.com/api/' . $end_point . '?' . $query;
		
		$headers = [
			'Authorization:',
			'Content-Type: application/json;charset=utf-8',
		];
		
		$ch = curl_init();
		
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		
		//ヘッダーも出力
		curl_setopt($ch, CURLOPT_HEADER, TRUE);
		
		$retry_cnt = 0;
		do {
			$response = curl_exec($ch);
			$info = curl_getinfo($ch);

			$headers = substr($response, 0, $info['header_size']);
			$response_json = substr($response, $info['header_size']);

			$response = json_decode($response_json);
			
			$result = null;
			if(! isset($response->ok) || $response->ok !== true) {
				if(isset($response->error)) {
					self::$errors[] = $response->error;
				} else {
					self::$errors[] = json_encode($response);
				}
				self::$is_error = true;

				$response_error = print_r($response->error, true);
				if(! $response_error) {
					++$retry_cnt;
					if($retry_cnt > 3) {
						break;
					}
					sleep(5);
					continue;
				}

                if(! in_array($response->error, [
                    'already_reacted',
                    'invalid_arguments',
                ])) {
                    $error_body = 'エンドポイント：'.$end_point."\n\n";
                    $error_body .= "エラー：".$response_error."\n\n";
                    $error_body .= "リクエスト：".json_encode($params, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT)."\n\n";
                }
			} else {
				$result = $response;
			}
		} while(0);

		curl_close($ch);
		
		return $result;
	}

    public static function reactionsGet($ch, $ts)
	{
		$params = [];
		$params['channel'] = $ch;
		$params['timestamp'] = $ts;

		return self::_request('reactions.get', $params);
	}

}
