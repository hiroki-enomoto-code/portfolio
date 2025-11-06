<?php

namespace App\Libs;

use Illuminate\Support\ServiceProvider;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageProcessingService
{
    private ImageManager $manager;
    private const MAX_WIDTH = 1080;
    private const QUALITY = 20;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * 画像を処理する
     *
     * @param UploadedFile|string $image
     * @param string $destinationPath
     * @return string 保存されたファイルのパス
     */
    public function process($image, string $destinationPath): string
    {
        // 画像を読み込む
        $img = is_string($image) 
            ? $this->manager->read($image)
            : $this->manager->read($image->getRealPath());

        $img->scaleDown(width: self::MAX_WIDTH);
        $img->save($destinationPath, self::QUALITY);

        return $destinationPath;
    }
}