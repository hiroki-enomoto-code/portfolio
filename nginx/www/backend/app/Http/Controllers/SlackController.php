<?php

namespace App\Http\Controllers;

use App\Models\Users;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use App\Libs\StorageService;

class SlackController extends Controller
{

    private $headers = [
        //'Authorization: Bearer ' . env('SLACK_BOT_TOKEN'),
        'Content-Type: application/json;charset=utf-8'
    ];
    private $baseUrl = 'https://slack.com/api/';

    public function makeRequest($endpoint, $params = [])
    {
        $url = $this->baseUrl . $endpoint;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($params),
            CURLOPT_HTTPHEADER => $this->headers
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            //throw new Exception("cURL Error: $error");
        }

        return json_decode($response, true);
    }

    public function getUserInfo($address = '')
    {
        $params = [
            'email' => $address,
        ];
        $ch = curl_init();
        $options = [
            CURLOPT_URL => $this->baseUrl . 'users.lookupByEmail?' . http_build_query($params),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $this->headers,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT => 30
        ];

        curl_setopt_array($ch, $options);
        $response = curl_exec($ch);
        $userResponse = json_decode($response, true);
        curl_close($ch);

        if (!$userResponse['ok']) {
            //\Log::error('Slack user lookup failed: ' . json_encode($userResponse));
            return null;
        }
        if (!isset($userResponse['user']) || !is_array($userResponse['user'])) {
            //\Log::error('Slack user data not found: ' . json_encode($userResponse));
            return null;
        }

        $profile = $userResponse['user']['profile'];
        $user = [
            'value' => $userResponse['user']['id'],
            'label' => $profile['real_name'],
            'name' => $userResponse['user']['name'],
            'email' => isset($profile['email']) ? $profile['email'] : '',
            'team' => $profile['title'],
        ];

        return $user;
    }

    public function getChannelUsers()
    {

        $members = StorageService::getJson('slack-ids.json');

        $users = [];
        $mails = [];
        $post_api = 'https://slack.com/api/users.info';
        $ch = curl_init();
        foreach ($members as $key => $userId) {

            $params = [
                'user' => $userId,
                'include_locale' => true
            ];

            $options = [
                CURLOPT_URL => $post_api . '?' . http_build_query($params),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $this->headers,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_TIMEOUT => 30
            ];

            curl_setopt_array($ch, $options);
            $response = curl_exec($ch);

            $userResponse = json_decode($response, true);

            if ($userResponse['ok']) {
                $profile = $userResponse['user']['profile'];
                $users[] = [
                    'value' => $userId,
                    'label' => $profile['real_name'],
                    'name' => $userResponse['user']['name'],
                    'email' => isset($userResponse['user']['profile']['email']) ? $userResponse['user']['profile']['email'] : '',
                    'team' => $profile['title'],
                ];
                $mails[] = isset($userResponse['user']['profile']['email']) ? $userResponse['user']['profile']['email'] : '';
            }

            usleep(200000);
        }
        curl_close($ch);

        StorageService::insertJson('slack-user-info.json', $users);
        //StorageService::insertJson('slack-mails.json', $mails);
        return response()->json($users);
    }

    public function gen()
    {
        $channel_id = "C08R632GNB1";
        $next_cursor = '';
        $memberIds = [];

        $ch = curl_init();
        do {
            $post_api = 'https://slack.com/api/conversations.members?channel=' . $channel_id . '&limit=150&cursor=' . $next_cursor;

            $options = [
                CURLOPT_URL => $post_api,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $this->headers,
            ];
            curl_setopt_array($ch, $options);
            $response = curl_exec($ch);

            $response = json_decode($response);
            if (isset($response->members)) {
                $memberIds = array_merge($memberIds, $response->members);
            }
            if (isset($response->response_metadata->next_cursor)) {
                $next_cursor = $response->response_metadata->next_cursor;
            }

            //var_dump($response);
        } while (!empty($next_cursor));
        curl_close($ch);

        return response()->json($memberIds);
    }

    private function getJson(string $path)
    {
        try {
            if (!Storage::exists($path)) {
                throw new \Exception("File not found: {$path}");
            }

            $content = Storage::get($path);
            $data = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON format: ' . json_last_error_msg());
            }

            return $data;
        } catch (\Exception $e) {
            //\Log::error('JSON file read error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * リッチなテストメッセージを送信する（ブロック形式）
     * 
     * @param string $channel チャンネルID
     * @param array $blocks メッセージブロック
     * @return array APIレスポンス
     */
    public function sendRichTestMessage()
    {
        $channel = 'C08R632GNB1';
        $blocks = null;


        // デフォルトのブロック形式メッセージ
        if (!$blocks) {
            $blocks = [
                [
                    "type" => "section",
                    "text" => [
                        "type" => "mrkdwn",
                        "text" => "*テストメッセージ* :white_check_mark:\n\n本日のテスト実行が完了しました。"
                    ]
                ],
                [
                    "type" => "divider"
                ],
                [
                    "type" => "section",
                    "fields" => [
                        [
                            "type" => "mrkdwn",
                            "text" => "*実行時間:*\n" . date('Y-m-d H:i:s')
                        ],
                        [
                            "type" => "mrkdwn",
                            "text" => "*ステータス:*\n:large_green_circle: 正常"
                        ]
                    ]
                ]
            ];
        }

        $params = [
            'channel' => $channel,
            'blocks' => json_encode($blocks),
        ];

        $response = $this->makeRequest('chat.postMessage', $params);

        if (!$response['ok']) {
            //\Log::error('Slack rich message send failed: ' . json_encode($response));
        }

        return $response;
    }
}
