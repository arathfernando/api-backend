import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGroupRuleDto } from 'src/core/dtos/community-group/create-group-rule.dto';
import { CommunityGroup } from 'src/database/entities';
import { GroupRule } from 'src/database/entities/group-rules.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupRulesService {
  constructor(
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(GroupRule)
    private readonly groupRuleRepository: Repository<GroupRule>,
  ) {}
  public async createGroupRule(
    data: CreateGroupRuleDto,
    user_id: number,
  ): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: data.group_id,
          created_by: user_id,
        },
      });

      data.rules.forEach(async (rule) => {
        const ruleSchema = new GroupRule();
        ruleSchema.rule = rule.rule;
        ruleSchema.community_group = group;
        ruleSchema.created_by = user_id;

        await this.groupRuleRepository.save(ruleSchema);
      });

      return {
        message: 'Group rules are added successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getGroupRules(id: number): Promise<any> {
    try {
      return this.groupRuleRepository.find({
        where: {
          community_group: {
            id,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGroupRules(
    data: CreateGroupRuleDto,
    user_id: number,
  ): Promise<any> {
    try {
      const group = await this.communityGroupRepository.findOne({
        where: {
          id: data.group_id,
          created_by: user_id,
        },
      });

      await this.groupRuleRepository.delete({
        community_group: {
          id: group.id,
        },
      });

      await this.createGroupRule(data, user_id);

      return {
        message: 'updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
