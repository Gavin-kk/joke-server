import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '@src/common/decorator/auth.decorator';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import * as joi from 'joi';

const checkNum = joi.number().required();

@ApiTags('关注模块')
@Controller('api/v1/follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOperation({ summary: '关注用户', description: '需要传入 被关注用户的id' })
  @ApiBearerAuth()
  @Post()
  @Auth()
  public async follow(
    @Body() { follwoId }: CreateFollowDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.followService.followUsers(follwoId, userId);
  }

  @ApiOperation({ summary: '获取个人关注的用户列表 需要登录' })
  @ApiBearerAuth()
  @Get()
  @Auth()
  public async getFollowMeUserList(@CurrentUser('id') userId: number) {
    return this.followService.getFollowMeUserList(userId);
  }

  @ApiOperation({ summary: '查询互相关注的用户列表 需要登录' })
  @ApiBearerAuth()
  @Get('mutual')
  @Auth()
  public async getMutualList(@CurrentUser('id') userId: number) {
    return this.followService.getMutualList(userId);
  }

  @ApiOperation({ summary: '获取粉丝用户列表 需要登录' })
  @ApiBearerAuth()
  @Get('fans')
  @Auth()
  public async getFanList(@CurrentUser('id') userId: number) {
    return this.followService.getFanList(userId);
  }

  @ApiOperation({ summary: '查看当前用户是否和目标用户是互相关注' })
  @ApiBearerAuth()
  @Get('mutual/whether')
  @Auth()
  public async mutualWhether(
    @CurrentUser('id') userId: number,
    @Query('targetUserId', new LineCheckTransformPipe(checkNum))
    targetUserId: number,
  ): Promise<boolean> {
    return this.followService.mutualWhether(userId, targetUserId);
  }
}
